import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, Text, View } from 'react-native'
import { dimensionWarnings, listPilotMarks, TRUCK_TYPE_OPTIONS } from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { IconChip, IconFab } from '@/components/IconFab'
import { MapLegendTutorial } from '@/components/MapLegendTutorial'
import { MockMap } from '@/components/MockMap'
import { PlaceSearch } from '@/components/PlaceSearch'
import { RouteAlertCard } from '@/components/RouteAlertCard'
import { SetupNotice } from '@/components/SetupNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { useRouteAlerts } from '@/hooks/useRouteAlerts'
import { hasSeenMapLegend, markMapLegendSeen } from '@/lib/map-onboarding'
import type { PlaceHit } from '@/lib/places'

/** Clearance above the tab bar edge (scene already excludes tab bar height). */
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
  const truck = auth.truck
  const tags = routeTags(truck)
  const marks = useMemo(
    () =>
      listPilotMarks('pilot-barra-velha').map((mark) => ({
        id: mark.id,
        latitude: mark.latitude,
        longitude: mark.longitude,
        status: mark.status,
        label: mark.label,
      })),
    [],
  )

  const routeAlerts = useRouteAlerts({
    enabled: Boolean(auth.session) && location.status === 'ready',
    user: location.point,
    destination: destination?.point ?? null,
    truckType: truck?.type ?? null,
  })

  useEffect(() => {
    void hasSeenMapLegend().then((seen) => setLegendSeen(seen))
  }, [])

  const onSelectPlace = (place: PlaceHit) => {
    setDestination(place)
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

  return (
    <View style={styles.root}>
      <View style={styles.mapArea}>
        <MockMap
          userLocation={location.point}
          destination={destination?.point ?? null}
          blocked={tags.includes('Não passa')}
          marks={marks}
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
          {auth.truckPending ? (
            <View style={styles.notice}>
              <SetupNotice onConfigure={auth.openOnboarding} />
            </View>
          ) : null}

          <PlaceSearch
            near={location.point}
            tags={tags}
            onSelect={onSelectPlace}
            onClear={() => setDestination(null)}
          />

          <View style={styles.chips} pointerEvents="box-none">
            <IconChip icon="bus-outline" label={truckLabel} />
            {destination ? <IconChip icon="flag-outline" label="Destino" active /> : null}
            {!destination ? (
              <IconChip icon="alert-circle-outline" label="Só urgência extrema" />
            ) : null}
          </View>

          {destination ? (
            <View style={styles.legendRow} pointerEvents="none">
              <LegendPill color={tokens.color.pass} label="Passa" />
              <LegendPill color={tokens.color.danger} label="Não passa" />
              <LegendPill color={tokens.color.brand} label="Você" />
            </View>
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

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  )
}

function routeTags(
  truck: { heightMeters: number; widthMeters: number; lengthMeters: number; totalWeightKg: number } | null,
): string[] {
  const tags: string[] = []
  if (!truck) tags.push('Sem caminhão')
  if (truck && dimensionWarnings(truck).length > 0) tags.push('Não passa')
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
    gap: tokens.space[3],
  },
  notice: {
    marginBottom: 0,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: tokens.space[2],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  pillLabel: {
    fontFamily: tokens.font.label,
    fontSize: 11,
    color: tokens.color.ink,
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
