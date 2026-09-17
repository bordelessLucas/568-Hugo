import { useEffect, useState } from 'react'
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  COMMUNITY_STATUS_LABEL,
  createCommunity,
  deletePendingCommunity,
  loadCommunityDetail,
  listVisibleCommunities,
  updatePendingCommunity,
  type Community,
  type CommunityFeedItem,
} from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import { Input } from '@/components/Input'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useAuth } from '@/contexts/AuthContext'
import { toUserMessage } from '@/lib/auth-errors'
import { pressStyle } from '@/lib/press'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { useSettings } from '@/contexts/SettingsContext'

type Mode = 'list' | 'detail' | 'create' | 'edit' | 'cancel'

const DEFAULT_POINT = { latitude: -26.632, longitude: -48.6849 }

export function CommunityScreen() {
  const auth = useAuth()
  const settings = useSettings()
  const location = useDeviceLocation(settings.shareLocation)
  const [mode, setMode] = useState<Mode>('list')
  const [communities, setCommunities] = useState<Community[]>([])
  const [selected, setSelected] = useState<Community | null>(null)
  const [feed, setFeed] = useState<CommunityFeedItem[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reloadList = async () => {
    if (!auth.session) return
    setLoading(true)
    setError('')
    try {
      const next = await listVisibleCommunities(auth.session.uid)
      setCommunities(next)
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reloadList()
  }, [auth.session?.uid])

  const openDetail = async (community: Community) => {
    if (!auth.session) return
    setError('')
    setLoading(true)
    try {
      const detail = await loadCommunityDetail(community.id, auth.session.uid)
      setSelected(detail.community)
      setFeed(detail.feed)
      setMode('detail')
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const backToList = () => {
    setMode('list')
    setSelected(null)
    setFeed([])
    setError('')
    void reloadList()
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'list') return false
      if (mode === 'detail') {
        backToList()
        return true
      }
      if (mode === 'create') {
        setMode('list')
        setError('')
        return true
      }
      if (mode === 'edit' || mode === 'cancel') {
        setMode('detail')
        setError('')
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [mode])

  return (
    <Container edges={['top']}>
      <View style={styles.stack}>
        {mode === 'list' ? (
          <>
            <ScreenHeader
              title="Comunidade"
              subtitle="Veja marcações da região ou peça uma comunidade nova. Pedidos passam por um administrador."
              icon="people-outline"
            />
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? <Text style={styles.muted}>Carregando…</Text> : null}
            {!loading && communities.length === 0 ? (
              <Text style={styles.muted}>
                Ainda não há comunidades na sua lista. Você pode pedir a primeira abaixo.
              </Text>
            ) : null}
            {communities.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Abrir comunidade ${item.name}`}
                onPress={() => {
                  setNotice('')
                  void openDetail(item)
                }}
                style={pressStyle(styles.listCard, {
                  opacity: 0.92,
                  pressed: styles.listCardPressed,
                })}
              >
                <View style={styles.cardIcon}>
                  <Icon
                    name={item.system ? 'star-outline' : 'people-outline'}
                    size={20}
                    color={tokens.color.brand}
                  />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.muted}>
                    {item.city}/{item.state}
                  </Text>
                  <StatusChip status={item.status} />
                </View>
                <Icon name="chevron-forward" size={18} color={tokens.color.muted} />
              </Pressable>
            ))}
            <Button
              label="Pedir nova comunidade"
              onPress={() => {
                setError('')
                setNotice('')
                setMode('create')
              }}
            />
          </>
        ) : null}

        {mode === 'detail' && selected ? (
          <DetailView
            community={selected}
            feed={feed}
            notice={notice}
            isOwner={auth.session?.uid === selected.creatorId}
            onBack={backToList}
            onEdit={() => setMode('edit')}
            onCancelRequest={() => setMode('cancel')}
          />
        ) : null}

        {mode === 'create' ? (
          <CommunityForm
            title="Pedir nova comunidade"
            subtitle="Um administrador ainda precisa liberar. Você pode voltar sem enviar."
            submitLabel="Enviar pedido"
            locationHint={
              location.point
                ? 'Vamos usar sua localização atual no pedido.'
                : 'Sem GPS agora: usamos o ponto padrão da região piloto (Barra Velha / SC).'
            }
            initial={null}
            defaultPoint={location.point ?? DEFAULT_POINT}
            saving={saving}
            error={error}
            onBack={() => {
              setError('')
              setMode('list')
            }}
            onSubmit={async (draft) => {
              if (!auth.session) return
              setSaving(true)
              setError('')
              try {
                await createCommunity({ ...draft, creatorId: auth.session.uid })
                setNotice('Pedido enviado. Um administrador ainda precisa liberar.')
                setMode('list')
                await reloadList()
              } catch (caught) {
                setError(toUserMessage(caught))
              } finally {
                setSaving(false)
              }
            }}
          />
        ) : null}

        {mode === 'edit' && selected ? (
          <CommunityForm
            title="Editar pedido"
            subtitle="Só enquanto aguarda aprovação. Voltar descarta as mudanças desta tela."
            submitLabel="Salvar alterações"
            locationHint="O ponto do pedido continua o mesmo."
            initial={selected}
            defaultPoint={{ latitude: selected.latitude, longitude: selected.longitude }}
            saving={saving}
            error={error}
            onBack={() => {
              setError('')
              setMode('detail')
            }}
            onSubmit={async (draft) => {
              setSaving(true)
              setError('')
              try {
                const updated = await updatePendingCommunity({
                  ...selected,
                  ...draft,
                  status: 'pending',
                })
                setSelected(updated)
                setNotice('Pedido atualizado.')
                setMode('detail')
                await reloadList()
              } catch (caught) {
                setError(toUserMessage(caught))
              } finally {
                setSaving(false)
              }
            }}
          />
        ) : null}

        {mode === 'cancel' && selected ? (
          <View style={styles.card}>
            <Text style={styles.title}>Cancelar pedido?</Text>
            <Text style={styles.muted}>
              Isso remove o pedido de “{selected.name}”. Você pode pedir de novo depois.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              label="Voltar"
              variant="outline"
              disabled={saving}
              onPress={() => {
                setError('')
                setMode('detail')
              }}
            />
            <Button
              label="Sim, cancelar pedido"
              variant="danger"
              loading={saving}
              onPress={() => {
                if (!auth.session) return
                setSaving(true)
                setError('')
                void deletePendingCommunity(selected.id, auth.session.uid)
                  .then(async () => {
                    setNotice('Pedido cancelado.')
                    setSelected(null)
                    setMode('list')
                    await reloadList()
                  })
                  .catch((caught) => setError(toUserMessage(caught)))
                  .finally(() => setSaving(false))
              }}
            />
          </View>
        ) : null}
      </View>
    </Container>
  )
}

function StatusChip({ status }: { status: Community['status'] }) {
  const tone =
    status === 'approved'
      ? styles.chipApproved
      : status === 'pending'
        ? styles.chipPending
        : styles.chipRejected
  return (
    <View style={[styles.chip, tone]}>
      <Text style={styles.chipLabel}>{COMMUNITY_STATUS_LABEL[status]}</Text>
    </View>
  )
}

function DetailView({
  community,
  feed,
  notice,
  isOwner,
  onBack,
  onEdit,
  onCancelRequest,
}: {
  community: Community
  feed: CommunityFeedItem[]
  notice?: string
  isOwner: boolean
  onBack: () => void
  onEdit: () => void
  onCancelRequest: () => void
}) {
  const canManage = isOwner && community.status === 'pending' && !community.system
  return (
    <View style={styles.stackInner}>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <ScreenHeader
        title={community.name}
        subtitle={`${community.city}/${community.state}`}
        icon="map-outline"
      />
      <StatusChip status={community.status} />
      <Text style={styles.muted}>{community.description}</Text>
      <Text style={styles.section}>Marcações e ocorrências próximas</Text>
      {feed.length === 0 ? (
        <Text style={styles.muted}>Ainda não há marcações nesta região.</Text>
      ) : (
        feed.map((item) => (
          <View key={item.id} style={styles.mark}>
            <Icon
              name={item.status === 'passa' ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={item.status === 'passa' ? tokens.color.pass : tokens.color.danger}
            />
            <View style={styles.cardCopy}>
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.muted}>{item.notes}</Text>
            </View>
          </View>
        ))
      )}
      {canManage ? (
        <>
          <Button label="Editar pedido" variant="outline" onPress={onEdit} />
          <Button label="Cancelar pedido" variant="outline" onPress={onCancelRequest} />
        </>
      ) : null}
      <Button label="Voltar para a lista" onPress={onBack} />
    </View>
  )
}

function CommunityForm({
  title,
  subtitle,
  submitLabel,
  locationHint,
  initial,
  defaultPoint,
  saving,
  error,
  onBack,
  onSubmit,
}: {
  title: string
  subtitle: string
  submitLabel: string
  locationHint: string
  initial: Community | null
  defaultPoint: { latitude: number; longitude: number }
  saving: boolean
  error: string
  onBack: () => void
  onSubmit: (draft: {
    name: string
    description: string
    city: string
    state: string
    latitude: number
    longitude: number
  }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [stateUf, setStateUf] = useState(initial?.state ?? 'SC')
  const [localError, setLocalError] = useState('')

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{subtitle}</Text>
      <Text style={styles.muted}>{locationHint}</Text>
      <Input label="Nome" value={name} onChangeText={setName} placeholder="Nome da comunidade" icon="business" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Para quem é esta comunidade"
        icon="document"
      />
      <Input label="Cidade" value={city} onChangeText={setCity} placeholder="Barra Velha" icon="locate" />
      <Input label="UF" value={stateUf} onChangeText={setStateUf} placeholder="SC" />
      {localError || error ? <Text style={styles.error}>{localError || error}</Text> : null}
      <Button
        label={submitLabel}
        loading={saving}
        onPress={() => {
          setLocalError('')
          if (name.trim().length < 3) {
            setLocalError('Informe um nome com pelo menos 3 caracteres.')
            return
          }
          if (description.trim().length < 8) {
            setLocalError('Descreva a comunidade com pelo menos 8 caracteres.')
            return
          }
          if (!city.trim() || stateUf.trim().length !== 2) {
            setLocalError('Informe cidade e UF com 2 letras.')
            return
          }
          void onSubmit({
            name,
            description,
            city,
            state: stateUf,
            latitude: defaultPoint.latitude,
            longitude: defaultPoint.longitude,
          })
        }}
      />
      <Button label="Voltar" variant="outline" disabled={saving} onPress={onBack} />
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[3],
    paddingBottom: tokens.space[8],
  },
  stackInner: {
    gap: tokens.space[3],
  },
  card: {
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  listCard: {
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCardPressed: {
    backgroundColor: tokens.color.fog,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  muted: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  section: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.brand,
  },
  mark: {
    flexDirection: 'row',
    gap: tokens.space[3],
    padding: tokens.space[3],
    borderRadius: tokens.radius.field,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
  notice: {
    color: tokens.color.pass,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  chipApproved: {
    backgroundColor: '#E8F6EE',
  },
  chipPending: {
    backgroundColor: '#FFF4E5',
  },
  chipRejected: {
    backgroundColor: '#FDECEB',
  },
  chipLabel: {
    fontFamily: tokens.font.label,
    fontSize: 11,
    color: tokens.color.ink,
  },
})
