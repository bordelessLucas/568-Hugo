import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  dimensionWarnings,
  filterMapMarksForTruck,
  formatRouteSummary,
  listPilotMarks,
  DEMO_OFFICIAL_RESTRICTIONS,
  DEMO_SAFE_PLACES,
  buildRestrictionMark,
  buildSafePlaceMark,
  ROUTE_STATUS_LABEL,
  TRUCK_TYPE_OPTIONS,
  type RouteResult,
} from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { IconChip, IconFab } from '@/components/IconFab'
import { MapLegendTutorial } from '@/components/MapLegendTutorial'
import { MockMap } from '@/components/MockMap'
import { PlaceSearch } from '@/components/PlaceSearch'
import { RouteAlertCard } from '@/components/RouteAlertCard'
import { SetupNotice } from '@/components/SetupNotice'
import { Icon } from '@/components/Icon'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { useRouteAlerts } from '@/hooks/useRouteAlerts'
import { hasSeenMapLegend, markMapLegendSeen } from '@/lib/map-onboarding'
import type { PlaceHit } from '@/lib/places'
import { pressStyle } from '@/lib/press'
import { requestTruckRoute } from '@/lib/routing'

const FAB_GAP = 20

export function HomeScreen() {
  const auth = useAuth()
  const settings = useSettings()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const location = useDeviceLocation(settings.shareLocation)
  const [destination, setDestination] = useState<PlaceHit | null>(null)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [legendSeen, setLegendSeen] = useState(true)
  const [result, setResult] = useState<RouteResult | null>(null)
  const [routing, setRouting] = useState(false)
  const truck = auth.truck
  const path = result?.status === 'compatible' ? result.path : []
  const tags = routeTags(truck, result)
  const routeBlocked = tags.includes('Não passa')

  const marks = useMemo(() => {
    const pilot = listPilotMarks('pilot-barra-velha').map((mark) => ({
      id: mark.id,
      latitude: mark.latitude,
      longitude: mark.longitude,
      status: mark.status,
      label: mark.label,
      truckType: mark.truckType,
      urgency: mark.urgency === 'extreme' ? ('extreme' as const) : ('normal' as const),
    }))
    return filterMapMarksForTruck(pilot, truck?.type ?? null)
  }, [truck?.type])
  const safetyMarks = useMemo(() => [
    ...DEMO_OFFICIAL_RESTRICTIONS.map((item) => buildRestrictionMark(item, truck, new Date())),
    ...DEMO_SAFE_PLACES.map(buildSafePlaceMark),
  ], [truck])

  const routeAlerts = useRouteAlerts({
    enabled: Boolean(auth.session) && location.status === 'ready',
    user: location.point,
    destination: destination?.point ?? null,
    path,
    truckType: truck?.type ?? null,
  })

  const alertOpen = Boolean(routeAlerts.alert)

  useEffect(() => {
    void hasSeenMapLegend().then((seen) => setLegendSeen(seen))
  }, [])

  useEffect(() => {
    if (!destination?.point || !location.point || !truck) {
      setResult(null)
      setRouting(false)
      return
    }
    let active = true
    setRouting(true)
    void requestTruckRoute({
      origin: location.point,
      destination: destination.point,
    }).then((next) => {
      if (!active) return
      setResult(next)
      setRouting(false)
    })
    return () => {
      active = false
    }
  }, [destination, location.point, truck])

  const onSelectPlace = (place: PlaceHit) => {
    setDestination(place)
    setResult(null)
    if (!legendSeen) setTutorialOpen(true)
  }

  const confirmTutorial = () => {
    setTutorialOpen(false)
    setLegendSeen(true)
    void markMapLegendSeen()
  }

  const truckLabel = truck
    ? `${TRUCK_TYPE_OPTIONS[truck.type].label} em uso`
    : 'Sem caminhão cadastrado'

  const topPad = insets.top + tokens.space[3]
  const sidePad = Math.max(insets.left, insets.right, tokens.space[4])
  const statusLine = routeStatusLine(routing, result, Boolean(destination && truck))
  const locationBanner = locationBannerCopy(settings.shareLocation, location.status)

  return (
    <View style={styles.root}>
      <View style={styles.mapArea}>
        <MockMap
          userLocation={location.point}
          destination={destination?.point ?? null}
          blocked={routeBlocked}
          marks={marks}
          safetyMarks={safetyMarks}
          path={path}
          highlightId={
            routeAlerts.alert?.source.kind === 'pilot'
              ? routeAlerts.alert.source.id.replace(/^pilot:/, '')
              : routeAlerts.alert?.source.id
          }
        />

        <View
          style={[
            styles.topChrome,
            {
              paddingTop: topPad,
              paddingLeft: sidePad,
              paddingRight: sidePad,
            },
          ]}
          pointerEvents="box-none"
        >
          {!alertOpen ? (
            <Text style={styles.mapSupportLabel} accessibilityRole="text">
              Mapa de apoio (simulado)
            </Text>
          ) : null}

          {locationBanner ? (
            <View style={styles.locationBanner} accessibilityRole="alert">
              <Icon name="locate-outline" size={18} color={tokens.color.danger} />
              <Text style={styles.locationBannerText}>{locationBanner}</Text>
            </View>
          ) : null}

          {auth.truckPending && !alertOpen ? (
            <View style={styles.notice}>
              <SetupNotice onConfigure={auth.openOnboarding} />
            </View>
          ) : null}

          <PlaceSearch
            near={location.point}
            tags={tags}
            onSelect={onSelectPlace}
            onClear={() => {
              setDestination(null)
              setResult(null)
            }}
          />

          {!alertOpen && !destination ? (
            <View style={styles.chips} pointerEvents="box-none">
              <IconChip icon="bus-outline" label={truckLabel} />
              <IconChip
                icon="alert-circle-outline"
                label="Só urgência extrema"
                tone="muted"
              />
            </View>
          ) : null}

          {!alertOpen && destination ? (
            <Text style={styles.truckCaption} numberOfLines={1}>
              {truckLabel} · Destino
            </Text>
          ) : null}

          {statusLine ? (
            <Text
              style={[
                styles.statusPill,
                result?.status === 'blocked' ? styles.statusBlocked : null,
              ]}
            >
              {statusLine}
            </Text>
          ) : null}

          {destination && !alertOpen ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver legenda do mapa"
              onPress={() => setTutorialOpen(true)}
              style={pressStyle(styles.legendLink, { opacity: 0.8 })}
            >
              <Text style={styles.legendLinkText}>Cores do mapa</Text>
            </Pressable>
          ) : null}
        </View>

        {routeAlerts.alert ? (
          <View
            style={[
              styles.alertDock,
              {
                left: sidePad,
                right: sidePad,
                bottom: FAB_GAP + 72,
              },
            ]}
            pointerEvents="box-none"
          >
            <RouteAlertCard
              alert={routeAlerts.alert}
              busy={routeAlerts.busy}
              hapticEnabled={settings.sounds}
              onUnderstand={routeAlerts.understand}
              onDismiss={routeAlerts.dismiss}
              onConfirmContinues={() => {
                void routeAlerts.answer('continues')
              }}
              onConfirmCleared={() => {
                void routeAlerts.answer('cleared')
              }}
              onConfirmUnknown={() => {
                void routeAlerts.answer('unknown')
              }}
            />
            {routeAlerts.error ? <Text style={styles.alertError}>{routeAlerts.error}</Text> : null}
          </View>
        ) : routeAlerts.error ? (
          <View
            style={[
              styles.alertDock,
              {
                left: sidePad,
                right: sidePad,
                bottom: FAB_GAP + 72,
              },
            ]}
          >
            <Text style={styles.alertError}>{routeAlerts.error}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.fabDock,
            {
              bottom: FAB_GAP,
              right: sidePad,
            },
          ]}
          pointerEvents="box-none"
        >
          <IconFab
            icon="warning-outline"
            label="Ocorrência"
            tone="accent"
            accessibilityHint="Opcional. Registra passa ou não passa no ponto atual."
            onPress={() => router.push('/ocorrencia')}
          />
        </View>
      </View>

      <MapLegendTutorial visible={tutorialOpen} onConfirm={confirmTutorial} />
    </View>
  )
}

function locationBannerCopy(
  shareLocation: boolean,
  status: 'pending' | 'ready' | 'denied' | 'unavailable',
): string | null {
  if (!shareLocation) {
    return 'Localização desligada em Ajustes. Sem ela, avisos na rota e distância não funcionam.'
  }
  if (status === 'denied') {
    return 'Localização bloqueada. Ative no aparelho ou em Ajustes → Usar localização.'
  }
  if (status === 'unavailable') {
    return 'GPS indisponível agora. O mapa segue, mas a origem pode ficar parada.'
  }
  return null
}

function routeStatusLine(
  routing: boolean,
  result: RouteResult | null,
  ready: boolean,
): string | null {
  if (!ready) return null
  if (routing) return ROUTE_STATUS_LABEL.loading
  if (!result) return null
  if (result.status === 'compatible') {
    return `${ROUTE_STATUS_LABEL.compatible} · ${formatRouteSummary(result)}`
  }
  if (result.status === 'blocked') return result.message || ROUTE_STATUS_LABEL.blocked
  return result.message || ROUTE_STATUS_LABEL.unavailable
}

function routeTags(
  truck: {
    heightMeters: number
    widthMeters: number
    lengthMeters: number
    totalWeightKg: number
  } | null,
  result: RouteResult | null,
): string[] {
  const tags: string[] = []
  if (!truck) tags.push('Sem caminhão')
  if (truck && dimensionWarnings(truck).length > 0) tags.push('Medidas')
  if (result?.status === 'blocked') tags.push('Não passa')
  return tags
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.fog,
  },
  mapArea: {
    flex: 1,
  },
  topChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    gap: tokens.space[2],
  },
  mapSupportLabel: {
    alignSelf: 'flex-start',
    fontFamily: tokens.font.label,
    fontSize: 11,
    color: tokens.color.muted,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[2],
    padding: tokens.space[3],
    borderRadius: tokens.radius.field,
    borderWidth: 1,
    borderColor: '#F0C4C0',
    backgroundColor: 'rgba(255,248,247,0.96)',
  },
  locationBannerText: {
    flex: 1,
    fontFamily: tokens.font.body,
    fontSize: 13,
    lineHeight: 18,
    color: tokens.color.ink,
  },
  notice: {
    marginBottom: 0,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  truckCaption: {
    alignSelf: 'flex-start',
    fontFamily: tokens.font.label,
    fontSize: 12,
    color: tokens.color.muted,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  legendLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  legendLinkText: {
    fontFamily: tokens.font.label,
    fontSize: 12,
    color: tokens.color.brand,
  },
  statusPill: {
    alignSelf: 'flex-start',
    fontFamily: tokens.font.label,
    fontSize: 12,
    color: tokens.color.ink,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: tokens.color.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  statusBlocked: {
    color: tokens.color.onBrand,
    backgroundColor: tokens.color.danger,
    borderColor: tokens.color.danger,
  },
  fabDock: {
    position: 'absolute',
    zIndex: 3,
  },
  alertDock: {
    position: 'absolute',
    zIndex: 4,
    maxHeight: '46%',
  },
  alertError: {
    fontFamily: tokens.font.body,
    fontSize: 12,
    color: tokens.color.danger,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: tokens.space[2],
    borderRadius: tokens.radius.field,
    marginTop: tokens.space[2],
  },
})
