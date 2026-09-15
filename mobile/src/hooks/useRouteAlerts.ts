import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadRouteAlertForTrip,
  ROUTE_ALERT,
  submitAlertConfirmation,
  type AlertAnswer,
  type EvaluatedRouteAlert,
  type TruckType,
} from '@rotatrucks/back'
import { toUserMessage } from '@/lib/auth-errors'

type Point = { latitude: number; longitude: number }

interface UseRouteAlertsArgs {
  enabled: boolean
  user: Point | null
  destination: Point | null
  truckType: TruckType | null
}

interface UseRouteAlertsResult {
  alert: EvaluatedRouteAlert | null
  busy: boolean
  error: string
  understand: () => void
  dismiss: () => void
  answer: (value: AlertAnswer) => Promise<void>
}

export function useRouteAlerts({
  enabled,
  user,
  destination,
  truckType,
}: UseRouteAlertsArgs): UseRouteAlertsResult {
  const [alert, setAlert] = useState<EvaluatedRouteAlert | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const seenRef = useRef(new Set<string>())
  const confirmedRef = useRef(new Set<string>())
  const dismissedRef = useRef(new Map<string, number>())
  const originRef = useRef<Point | null>(null)
  const confirmShownAtRef = useRef<number | null>(null)
  const confirmAlertIdRef = useRef<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (destination && user && !originRef.current) {
      originRef.current = user
    }
    if (!destination) {
      originRef.current = null
      seenRef.current = new Set()
      confirmedRef.current = new Set()
      confirmShownAtRef.current = null
      confirmAlertIdRef.current = null
    }
  }, [destination, user])

  const refresh = useCallback(async () => {
    if (!enabled || !user) {
      setAlert(null)
      return
    }
    if (destination && !originRef.current) {
      originRef.current = user
    }
    const requestId = ++requestIdRef.current
    try {
      const next = await loadRouteAlertForTrip({
        user,
        routeOrigin: destination ? originRef.current : null,
        destination,
        truckType,
        seenIds: seenRef.current,
        confirmedIds: confirmedRef.current,
        dismissedUntil: dismissedRef.current,
      })
      if (requestId !== requestIdRef.current) return

      if (next?.phase === 'confirm') {
        if (
          confirmShownAtRef.current == null ||
          confirmAlertIdRef.current !== next.source.id
        ) {
          confirmShownAtRef.current = Date.now()
          confirmAlertIdRef.current = next.source.id
        } else if (
          Date.now() - confirmShownAtRef.current >=
          ROUTE_ALERT.confirmAutoDismissMs
        ) {
          confirmedRef.current.add(next.source.id)
          confirmShownAtRef.current = null
          confirmAlertIdRef.current = null
          setAlert(null)
          return
        }
      } else {
        confirmShownAtRef.current = null
        confirmAlertIdRef.current = null
      }
      setAlert(next)
      setError('')
    } catch (caught) {
      if (requestId !== requestIdRef.current) return
      setError(toUserMessage(caught))
    }
  }, [destination, enabled, truckType, user])

  useEffect(() => {
    void refresh()
    if (!enabled) return
    const timer = setInterval(() => {
      void refresh()
    }, 4000)
    return () => clearInterval(timer)
  }, [enabled, refresh])

  const understand = () => {
    if (!alert) return
    seenRef.current.add(alert.source.id)
    requestIdRef.current += 1
    setAlert(null)
    void refresh()
  }

  const dismiss = () => {
    if (!alert) return
    const id = alert.source.id
    dismissedRef.current.set(id, Date.now() + ROUTE_ALERT.dismissCooldownMs)
    if (alert.phase === 'confirm') {
      confirmedRef.current.add(id)
      confirmShownAtRef.current = null
      confirmAlertIdRef.current = null
    }
    requestIdRef.current += 1
    setAlert(null)
  }

  const answer = async (value: AlertAnswer) => {
    if (!alert) return
    setBusy(true)
    setError('')
    try {
      await submitAlertConfirmation({ alertId: alert.source.id, answer: value })
      confirmedRef.current.add(alert.source.id)
      confirmShownAtRef.current = null
      confirmAlertIdRef.current = null
      requestIdRef.current += 1
      setAlert(null)
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return { alert, busy, error, understand, dismiss, answer }
}
