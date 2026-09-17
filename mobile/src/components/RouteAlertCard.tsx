import * as Haptics from 'expo-haptics'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  ALERT_STATUS_LABEL,
  ALERT_URGENCY_LABEL,
  formatDistanceLabel,
  REPORT_CATEGORY_OPTIONS,
  type EvaluatedRouteAlert,
} from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { pressStyle } from '@/lib/press'

interface RouteAlertCardProps {
  alert: EvaluatedRouteAlert
  busy?: boolean
  hapticEnabled?: boolean
  onUnderstand: () => void
  onDismiss: () => void
  onConfirmContinues: () => void
  onConfirmCleared: () => void
  onConfirmUnknown: () => void
}

export function RouteAlertCard({
  alert,
  busy = false,
  hapticEnabled = true,
  onUnderstand,
  onDismiss,
  onConfirmContinues,
  onConfirmCleared,
  onConfirmUnknown,
}: RouteAlertCardProps) {
  const extreme = alert.source.urgency === 'extreme'
  const confirm = alert.phase === 'confirm'
  const title = confirm
    ? 'Você passou por aqui'
    : extreme
      ? 'Urgência extrema por perto'
      : `Atenção na frente (${formatDistanceLabel(Math.abs(alert.alongMeters))})`

  const enter = useRef(new Animated.Value(0)).current
  const body = useRef(new Animated.Value(1)).current
  const phaseReady = useRef(false)
  const lastHapticId = useRef<string | null>(null)

  useEffect(() => {
    enter.setValue(0)
    Animated.timing(enter, { toValue: 1, duration: 200, useNativeDriver: true }).start()
  }, [alert.source.id, enter])

  useEffect(() => {
    if (!phaseReady.current) {
      phaseReady.current = true
      return
    }
    body.setValue(0.4)
    Animated.timing(body, { toValue: 1, duration: 160, useNativeDriver: true }).start()
  }, [alert.phase, body])

  useEffect(() => {
    if (!hapticEnabled || !extreme || confirm) return
    if (lastHapticId.current === alert.source.id) return
    lastHapticId.current = alert.source.id
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }, [alert.source.id, confirm, extreme, hapticEnabled])

  return (
    <Animated.View
      style={[
        styles.card,
        extreme ? styles.cardExtreme : null,
        {
          opacity: enter,
          transform: [
            {
              translateY: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
      accessibilityLabel={title}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.iconWrap, extreme ? styles.iconExtreme : null]}>
            <Icon
              name={confirm ? 'help-circle-outline' : extreme ? 'alert-circle' : 'warning-outline'}
              size={22}
              color={extreme ? tokens.color.onBrand : tokens.color.accentInk}
            />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.meta}>
              {ALERT_URGENCY_LABEL[alert.source.urgency]}
              {' · '}
              {REPORT_CATEGORY_OPTIONS[alert.source.category].label}
              {' · '}
              {ALERT_STATUS_LABEL[alert.source.status]}
              {alert.priority === 'low' ? ' · Baixa prioridade' : ''}
            </Text>
          </View>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={pressStyle(styles.close, { opacity: 0.7, pressed: styles.closePressed })}
          >
            <Icon name="close" size={22} color={tokens.color.muted} />
          </Pressable>
        </View>

        <Animated.View style={{ opacity: body }}>
          <Text style={styles.label}>{alert.source.label}</Text>
          <Text style={styles.notes}>{alert.source.notes}</Text>

          {confirm ? (
            <View style={styles.actions}>
              <Text style={styles.question}>Continua lá o problema?</Text>
              <Button
                label="Sim, continua"
                onPress={onConfirmContinues}
                loading={busy}
                disabled={busy}
              />
              <Button
                label="Não, liberou"
                variant="outline"
                onPress={onConfirmCleared}
                disabled={busy}
              />
              <Button
                label="Não sei / Depois"
                variant="outline"
                onPress={onConfirmUnknown}
                disabled={busy}
              />
            </View>
          ) : (
            <View style={styles.actions}>
              <Button label="Entendi" onPress={onUnderstand} disabled={busy} />
              <Button label="Fechar" variant="outline" onPress={onDismiss} disabled={busy} />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardExtreme: {
    borderColor: tokens.color.danger,
    borderWidth: 2,
  },
  scroll: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: tokens.space[4],
    gap: tokens.space[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.accent,
  },
  iconExtreme: {
    backgroundColor: tokens.color.danger,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: tokens.font.label,
    fontSize: 16,
    color: tokens.color.ink,
  },
  meta: {
    fontFamily: tokens.font.body,
    fontSize: 12,
    color: tokens.color.muted,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: {
    backgroundColor: tokens.color.fog,
  },
  label: {
    fontFamily: tokens.font.bodyMedium,
    fontSize: 15,
    color: tokens.color.ink,
  },
  notes: {
    fontFamily: tokens.font.body,
    fontSize: 14,
    color: tokens.color.muted,
  },
  question: {
    fontFamily: tokens.font.label,
    fontSize: 14,
    color: tokens.color.ink,
    marginBottom: 4,
  },
  actions: {
    gap: tokens.space[2],
    marginTop: tokens.space[2],
  },
})
