import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  GENDER_LABELS,
  TRUCK_TYPE_OPTIONS,
  TRUCK_TYPES,
  dimensionWarnings,
  type Truck,
  type TruckType,
} from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import { Input } from '@/components/Input'
import { ScreenHeader } from '@/components/ScreenHeader'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { useAuth } from '@/contexts/AuthContext'
import { toUserMessage } from '@/lib/auth-errors'
import { formatMeters, formatWeight, parseMeasure } from '@/lib/measures'
import { pressStyle } from '@/lib/press'

type Mode = 'list' | 'add' | 'edit' | 'settings'

export function ProfileScreen() {
  const auth = useAuth()
  const router = useRouter()
  const profile = auth.profile
  const [mode, setMode] = useState<Mode>('list')
  const [editing, setEditing] = useState<Truck | null>(null)
  const [selectingId, setSelectingId] = useState('')

  const closeForm = () => {
    setMode('list')
    setEditing(null)
  }

  return (
    <Container edges={['top']}>
      <View style={styles.stack}>
        <ScreenHeader
          title="Perfil"
          subtitle="Conta e caminhões. Dá para trocar o que está em uso e editar as medidas."
          icon="person-outline"
        />

        {mode === 'list' ? (
          <>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Icon name="id-card-outline" size={18} color={tokens.color.brand} />
                <Text style={styles.caption}>Conta</Text>
              </View>
              <Text style={styles.value}>{profile?.name || auth.session?.displayName || '—'}</Text>
              <Text style={styles.muted}>{profile?.email || auth.session?.email || '—'}</Text>
              <Text style={styles.muted}>
                Gênero: {profile?.gender ? GENDER_LABELS[profile.gender] : 'Não informado'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Icon name="bus-outline" size={18} color={tokens.color.brand} />
                <Text style={styles.caption}>Caminhões</Text>
              </View>
              <Text style={styles.muted}>O mapa usa o caminhão marcado como em uso.</Text>
              {auth.trucks.length === 0 ? (
                <Text style={styles.muted}>Nenhum caminhão cadastrado.</Text>
              ) : (
                auth.trucks.map((truck) => {
                  const active = auth.truck?.id === truck.id
                  return (
                    <View key={truck.id} style={styles.truck}>
                      <View style={styles.truckIcon}>
                        <Icon name="bus" size={18} color={tokens.color.brand} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.value}>
                          {TRUCK_TYPE_OPTIONS[truck.type].label}
                          {active ? ' · Em uso' : ''}
                        </Text>
                        <Text style={styles.muted}>
                          {formatMeters(truck.heightMeters)} · {formatMeters(truck.widthMeters)} ·{' '}
                          {formatMeters(truck.lengthMeters)} · {formatWeight(truck.totalWeightKg)}
                        </Text>
                      </View>
                      <View style={styles.truckActions}>
                        {!active ? (
                          <Button
                            label="Usar"
                            variant="outline"
                            block={false}
                            loading={selectingId === truck.id}
                            onPress={() => {
                              setSelectingId(truck.id)
                              void auth.selectTruck(truck.id).finally(() => setSelectingId(''))
                            }}
                          />
                        ) : null}
                        <Button
                          label="Editar"
                          variant="outline"
                          block={false}
                          onPress={() => {
                            setEditing(truck)
                            setMode('edit')
                          }}
                        />
                      </View>
                    </View>
                  )
                })
              )}
            </View>

            <Button
              label="Adicionar caminhão"
              onPress={() => {
                setEditing(null)
                setMode('add')
              }}
            />
            <Button
              label="Contatos de confiança"
              variant="secondary"
              onPress={() => router.push('/contatos-confianca')}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir configurações"
              onPress={() => setMode('settings')}
              style={pressStyle(styles.settingsEntry, { opacity: 0.9, pressed: styles.choicePressed })}
            >
              <View style={styles.settingsIcon}>
                <Icon name="settings-outline" size={20} color={tokens.color.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.value}>Configurações</Text>
                <Text style={styles.muted}>Localização, avisos, modo seguro e plano.</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={tokens.color.muted} />
            </Pressable>
            <Button
              label="Sair"
              variant="outline"
              onPress={() => {
                void auth.signOut().then(() => router.replace('/login'))
              }}
            />
          </>
        ) : mode === 'settings' ? (
          <SettingsScreen embedded backLabel="Voltar ao perfil" onBack={() => setMode('list')} />
        ) : (
          <TruckForm
            title={mode === 'edit' ? 'Editar caminhão' : 'Novo caminhão'}
            subtitle={
              mode === 'edit'
                ? 'Altere tipo ou medidas. O mapa usa estes números na hora.'
                : 'Fica na mesma conta. Depois de salvar, este vira o caminhão em uso.'
            }
            initial={editing}
            onCancel={closeForm}
            onSave={async (draft) => {
              if (mode === 'edit' && editing) {
                await auth.updateTruck({ ...editing, ...draft })
              } else {
                await auth.addTruck(draft)
              }
              closeForm()
            }}
          />
        )}
      </View>
    </Container>
  )
}

function TruckForm({
  title,
  subtitle,
  initial,
  onCancel,
  onSave,
}: {
  title: string
  subtitle: string
  initial: Truck | null
  onCancel: () => void
  onSave: (draft: {
    userId: string
    type: TruckType
    heightMeters: number
    widthMeters: number
    lengthMeters: number
    totalWeightKg: number
  }) => Promise<void>
}) {
  const auth = useAuth()
  const [truckType, setTruckType] = useState<TruckType | null>(initial?.type ?? null)
  const [height, setHeight] = useState(initial ? String(initial.heightMeters).replace('.', ',') : '')
  const [width, setWidth] = useState(initial ? String(initial.widthMeters).replace('.', ',') : '')
  const [length, setLength] = useState(initial ? String(initial.lengthMeters).replace('.', ',') : '')
  const [weightTons, setWeightTons] = useState(
    initial ? String(initial.totalWeightKg / 1000).replace('.', ',') : '',
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const draft = readDraft(height, width, length, weightTons)
  const warnings = draft ? dimensionWarnings(draft) : []

  const save = async () => {
    setError('')
    if (!auth.session || !truckType || !draft) {
      setError('Preencha o tipo e as medidas do caminhão.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        userId: auth.session.uid,
        type: truckType,
        ...draft,
      })
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Icon name={initial ? 'create-outline' : 'add-circle-outline'} size={18} color={tokens.color.brand} />
        <Text style={styles.caption}>{title}</Text>
      </View>
      <Text style={styles.muted}>{subtitle}</Text>
      {TRUCK_TYPES.map((value) => (
        <Pressable
          key={value}
          onPress={() => setTruckType(value)}
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
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>{TRUCK_TYPE_OPTIONS[value].label}</Text>
            <Text style={styles.muted}>{TRUCK_TYPE_OPTIONS[value].hint}</Text>
          </View>
        </Pressable>
      ))}
      <Input label="Altura (m)" value={height} onChangeText={setHeight} keyboard="decimal" />
      <Input label="Largura (m)" value={width} onChangeText={setWidth} keyboard="decimal" />
      <Input label="Comprimento (m)" value={length} onChangeText={setLength} keyboard="decimal" />
      <Input label="Peso total (t)" value={weightTons} onChangeText={setWeightTons} keyboard="decimal" />
      {warnings.map((warning) => (
        <Text key={warning} style={styles.error}>
          {warning}
        </Text>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Salvar"
        loading={saving}
        onPress={() => {
          void save()
        }}
      />
      <Button label="Voltar" variant="outline" disabled={saving} onPress={onCancel} />
    </View>
  )
}

function readDraft(height: string, width: string, length: string, weightTons: string) {
  const heightMeters = parseMeasure(height)
  const widthMeters = parseMeasure(width)
  const lengthMeters = parseMeasure(length)
  const tons = parseMeasure(weightTons)
  if (heightMeters === null || widthMeters === null || lengthMeters === null || tons === null) {
    return null
  }
  return {
    heightMeters,
    widthMeters,
    lengthMeters,
    totalWeightKg: Math.round(tons * 1000),
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingBottom: tokens.space[8],
  },
  card: {
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
  },
  caption: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.brand,
  },
  value: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
    color: tokens.color.ink,
  },
  muted: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  truck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  truckIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  truckActions: {
    gap: tokens.space[2],
  },
  settingsEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    borderWidth: 1,
    borderColor: tokens.color.line,
    borderRadius: tokens.radius.field,
    padding: tokens.space[3],
  },
  choiceOn: {
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.fog,
  },
  choicePressed: {
    backgroundColor: '#EAF4FB',
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
})
