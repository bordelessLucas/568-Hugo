import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_OPTIONS,
  REPORT_STATUSES,
  TRUCK_TYPE_OPTIONS,
  TRUCK_TYPES,
  createReport,
  reportCategoryRequiresNotes,
  type ReportCategory,
  type ReportStatus,
  type TruckType,
} from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import { Input } from '@/components/Input'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { toUserMessage } from '@/lib/auth-errors'
import { pressStyle } from '@/lib/press'

const STATUS_LABEL: Record<ReportStatus, string> = {
  passa: 'Passa',
  nao_passa: 'Não passa',
}

export function ReportScreen() {
  const auth = useAuth()
  const settings = useSettings()
  const router = useRouter()
  const location = useDeviceLocation(settings.shareLocation)
  const [category, setCategory] = useState<ReportCategory>('route_condition')
  const [truckType, setTruckType] = useState<TruckType | null>(auth.truck?.type ?? null)
  const [status, setStatus] = useState<ReportStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [extreme, setExtreme] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const save = async () => {
    setError('')
    if (!auth.session) {
      setError('Entre na conta para marcar a ocorrência.')
      return
    }
    if (!truckType || !status) {
      setError('Escolha o tipo do caminhão e se passa ou não passa.')
      return
    }
    if (!location.point) {
      setError('Permita a localização para gravar o ponto.')
      return
    }
    if ((reportCategoryRequiresNotes(category) || extreme) && notes.trim().length < 8) {
      setError('Descreva o que aconteceu com pelo menos 8 caracteres.')
      return
    }
    setSaving(true)
    try {
      await createReport({
        authorId: auth.session.uid,
        truckType,
        category,
        status,
        notes: notes.trim(),
        latitude: location.point.latitude,
        longitude: location.point.longitude,
        urgency: extreme ? 'extreme' : 'normal',
      })
      setDone(true)
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <Container>
        <View style={styles.stack}>
          <ScreenHeader
            title="Ocorrência salva"
            subtitle={
              extreme
                ? 'Aviso extremo pode aparecer para quem está perto, mesmo sem destino.'
                : 'Opcional. Aparece na área de Comunidade e pode avisar na rota.'
            }
            icon="checkmark-circle-outline"
            back
          />
          <Button label="Ver comunidade" onPress={() => router.replace('/comunidade')} />
          <Button label="Voltar ao mapa" variant="outline" onPress={() => router.replace('/home')} />
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <View style={styles.stack}>
        <ScreenHeader
          title="Marcar ocorrência"
          subtitle="Opcional, como no Waze. Só registre se quiser ajudar a rede."
          icon="warning-outline"
          back
        />

        <Text style={styles.caption}>O que aconteceu?</Text>
        {REPORT_CATEGORIES.map((value) => (
          <Pressable
            key={value}
            onPress={() => setCategory(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: category === value }}
            accessibilityLabel={REPORT_CATEGORY_OPTIONS[value].label}
            style={pressStyle([styles.choice, category === value ? styles.choiceOn : null], {
              opacity: 0.9,
              pressed: styles.choicePressed,
            })}
          >
            <Icon
              name={value === 'route_condition' ? 'trail-sign-outline' : 'warning-outline'}
              size={18}
              color={category === value ? tokens.color.brand : tokens.color.muted}
            />
            <View style={styles.choiceCopy}>
              <Text style={styles.label}>{REPORT_CATEGORY_OPTIONS[value].label}</Text>
              <Text style={styles.muted}>{REPORT_CATEGORY_OPTIONS[value].description}</Text>
            </View>
          </Pressable>
        ))}

        <Text style={styles.caption}>Tipo de caminhão</Text>
        {TRUCK_TYPES.map((value) => (
          <Pressable
            key={value}
            onPress={() => setTruckType(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: truckType === value }}
            accessibilityLabel={TRUCK_TYPE_OPTIONS[value].label}
            style={pressStyle([styles.choice, truckType === value ? styles.choiceOn : null], {
              opacity: 0.9,
              pressed: styles.choicePressed,
            })}
          >
            <Icon
              name="bus-outline"
              size={18}
              color={truckType === value ? tokens.color.brand : tokens.color.muted}
            />
            <Text style={styles.label}>{TRUCK_TYPE_OPTIONS[value].label}</Text>
          </Pressable>
        ))}

        <Text style={styles.caption}>Dá para seguir com o caminhão?</Text>
        <View style={styles.row}>
          {REPORT_STATUSES.map((value) => (
            <Pressable
              key={value}
              onPress={() => setStatus(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: status === value }}
              accessibilityLabel={STATUS_LABEL[value]}
              style={pressStyle(
                [styles.choice, styles.half, status === value ? styles.choiceOn : null],
                { opacity: 0.9, pressed: styles.choicePressed },
              )}
            >
              <Icon
                name={value === 'passa' ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={18}
                color={
                  status === value
                    ? value === 'passa'
                      ? tokens.color.pass
                      : tokens.color.danger
                    : tokens.color.muted
                }
              />
              <Text style={styles.label}>{STATUS_LABEL[value]}</Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder={
            reportCategoryRequiresNotes(category) || extreme
              ? 'Descreva o risco em pelo menos 8 caracteres'
              : 'Opcional'
          }
          icon="document"
          error={
            (reportCategoryRequiresNotes(category) || extreme) &&
            notes.trim().length > 0 &&
            notes.trim().length < 8
              ? 'Use pelo menos 8 caracteres.'
              : undefined
          }
        />
        {extreme ? (
            <Text style={styles.muted}>
              Urgência extrema exige uma descrição curta e não substitui polícia ou atendimento de emergência.
            </Text>
        ) : null}

        <Pressable
          onPress={() => setExtreme((value) => !value)}
          style={pressStyle([styles.choice, extreme ? styles.choiceDanger : null], {
            opacity: 0.9,
            pressed: styles.choicePressed,
          })}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: extreme }}
          accessibilityLabel="Marcar como urgência extrema"
        >
          <Icon
            name={extreme ? 'alert-circle' : 'alert-circle-outline'}
            size={18}
            color={extreme ? tokens.color.danger : tokens.color.muted}
          />
          <View style={styles.extremeCopy}>
            <Text style={styles.label}>Urgência extrema</Text>
            <Text style={styles.muted}>
              Só para acidente grave ou risco imediato. Aparece para quem está perto, mesmo sem destino.
            </Text>
          </View>
        </Pressable>

        <View style={styles.gps}>
          <Icon
            name={location.status === 'ready' ? 'locate' : 'locate-outline'}
            size={18}
            color={location.status === 'ready' ? tokens.color.pass : tokens.color.muted}
          />
          <Text style={styles.muted}>
            {location.status === 'ready'
              ? 'Localização pronta para gravar o ponto.'
              : location.status === 'denied'
                ? 'Localização bloqueada.'
                : location.status === 'unavailable'
                  ? 'Localização indisponível agora.'
                  : 'Buscando localização…'}
          </Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Salvar ocorrência"
          loading={saving}
          onPress={() => {
            void save()
          }}
        />
        <Button label="Cancelar" variant="outline" onPress={() => router.back()} />
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[3],
    paddingBottom: tokens.space[8],
  },
  caption: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.brand,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    borderWidth: 1,
    borderColor: tokens.color.line,
    borderRadius: tokens.radius.field,
    padding: tokens.space[3],
    backgroundColor: tokens.color.surface,
  },
  choiceOn: {
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.fog,
  },
  choiceCopy: {
    flex: 1,
    gap: 2,
  },
  choicePressed: {
    backgroundColor: '#EAF4FB',
  },
  choiceDanger: {
    borderColor: tokens.color.danger,
    backgroundColor: '#FDECEA',
  },
  extremeCopy: {
    flex: 1,
    gap: 2,
  },
  half: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.space[2],
  },
  label: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  gps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
  },
  muted: {
    flex: 1,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
})
