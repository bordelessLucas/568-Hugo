import { useEffect, useState } from 'react'
import { Pressable, ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native'
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
import { Icon, type IconName } from '@/components/Icon'
import { Input } from '@/components/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { toUserMessage } from '@/lib/auth-errors'
import { pressStyle } from '@/lib/press'

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
    setNotice('')
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
          <CommunityList
            communities={communities}
            loading={loading}
            notice={notice}
            error={error}
            onOpen={(item) => void openDetail(item)}
            onCreate={() => {
              setError('')
              setNotice('')
              setMode('create')
            }}
          />
        ) : null}

        {mode === 'detail' && selected ? (
          <DetailView
            community={selected}
            feed={feed}
            notice={notice}
            loading={loading}
            isOwner={auth.session?.uid === selected.creatorId}
            onBack={backToList}
            onEdit={() => setMode('edit')}
            onCancelRequest={() => setMode('cancel')}
          />
        ) : null}

        {mode === 'create' ? (
          <CommunityForm
            title="Pedir comunidade"
            subtitle="Seu pedido passa por um administrador antes de aparecer para todos."
            submitLabel="Enviar pedido"
            locationHint={
              location.point
                ? 'Vamos anexar sua localização atual ao pedido.'
                : 'Sem GPS agora: usaremos o ponto padrão da região piloto.'
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
            subtitle="Você pode editar enquanto a comunidade aguarda aprovação."
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
          <CancelRequest
            community={selected}
            error={error}
            saving={saving}
            onBack={() => {
              setError('')
              setMode('detail')
            }}
            onConfirm={() => {
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
        ) : null}
      </View>
    </Container>
  )
}

function CommunityList({
  communities,
  loading,
  notice,
  error,
  onOpen,
  onCreate,
}: {
  communities: Community[]
  loading: boolean
  notice: string
  error: string
  onOpen: (community: Community) => void
  onCreate: () => void
}) {
  return (
    <>
      <Hero
        eyebrow="Comunidade"
        title="Rotas compartilhadas"
        subtitle="Acompanhe marcações da região e peça novas comunidades para sua área."
        icon="people"
        countLabel={loading ? '...' : String(communities.length)}
      />
      {notice ? <Message tone="success" text={notice} /> : null}
      {error ? <Message tone="danger" text={error} /> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={tokens.color.brand} />
          <Text style={styles.muted}>Carregando comunidades...</Text>
        </View>
      ) : null}
      {!loading && communities.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="people-outline" size={24} color={tokens.color.muted} />
          <Text style={styles.emptyTitle}>Nenhuma comunidade ainda</Text>
          <Text style={styles.emptyText}>Você pode pedir a primeira comunidade da sua região.</Text>
        </View>
      ) : null}
      <View style={styles.list}>
        {communities.map((item) => (
          <CommunityCard key={item.id} community={item} onPress={() => onOpen(item)} />
        ))}
      </View>
      <Button label="Pedir nova comunidade" onPress={onCreate} />
    </>
  )
}

function CommunityCard({ community, onPress }: { community: Community; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir comunidade ${community.name}`}
      onPress={onPress}
      style={pressStyle(styles.listCard, {
        opacity: 0.92,
        pressed: styles.listCardPressed,
      })}
    >
      <View style={styles.cardIcon}>
        <Icon
          name={community.system ? 'star-outline' : 'people-outline'}
          size={21}
          color={tokens.color.brand}
        />
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{community.name}</Text>
          {community.system ? <Text style={styles.systemBadge}>Piloto</Text> : null}
        </View>
        <Text style={styles.muted}>{community.city}/{community.state}</Text>
        <StatusChip status={community.status} />
      </View>
      <Icon name="chevron-forward" size={18} color={tokens.color.muted} />
    </Pressable>
  )
}

function DetailView({
  community,
  feed,
  notice,
  loading,
  isOwner,
  onBack,
  onEdit,
  onCancelRequest,
}: {
  community: Community
  feed: CommunityFeedItem[]
  notice?: string
  loading: boolean
  isOwner: boolean
  onBack: () => void
  onEdit: () => void
  onCancelRequest: () => void
}) {
  const canManage = isOwner && community.status === 'pending' && !community.system
  const blocked = feed.filter((item) => item.status === 'nao_passa').length
  const clear = feed.filter((item) => item.status === 'passa').length

  return (
    <View style={styles.stackInner}>
      <TopBack title={community.name} subtitle={`${community.city}/${community.state}`} onBack={onBack} />
      {notice ? <Message tone="success" text={notice} /> : null}
      <View style={styles.detailHero}>
        <View style={styles.detailHeroTop}>
          <View style={styles.detailIcon}>
            <Icon name={community.system ? 'star' : 'people'} size={24} color={tokens.color.onBrand} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.detailTitle}>{community.name}</Text>
            <Text style={styles.detailSubtitle}>{community.description}</Text>
          </View>
        </View>
        <StatusChip status={community.status} inverse />
      </View>
      <View style={styles.summaryRow}>
        <Metric label="Marcações" value={String(feed.length)} />
        <Metric label="Passa" value={String(clear)} />
        <Metric label="Não passa" value={String(blocked)} />
      </View>
      <Text style={styles.sectionTitle}>Marcações próximas</Text>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={tokens.color.brand} />
          <Text style={styles.muted}>Atualizando marcações...</Text>
        </View>
      ) : null}
      {feed.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="map-outline" size={24} color={tokens.color.muted} />
          <Text style={styles.emptyTitle}>Sem marcações nesta região</Text>
          <Text style={styles.emptyText}>Quando houver relatos próximos, eles aparecem aqui.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {feed.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </View>
      )}
      {canManage ? (
        <View style={styles.actionsGrid}>
          <Button label="Editar pedido" variant="outline" onPress={onEdit} />
          <Button label="Cancelar pedido" variant="outline" onPress={onCancelRequest} />
        </View>
      ) : null}
      <Button label="Voltar para a lista" onPress={onBack} />
    </View>
  )
}

function FeedCard({ item }: { item: CommunityFeedItem }) {
  const pass = item.status === 'passa'
  return (
    <View style={styles.feedCard}>
      <View style={[styles.feedIcon, pass ? styles.feedIconPass : styles.feedIconDanger]}>
        <Icon
          name={pass ? 'checkmark-circle' : 'close-circle'}
          size={20}
          color={pass ? tokens.color.pass : tokens.color.danger}
        />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{item.label}</Text>
        <Text style={styles.muted}>{item.notes}</Text>
        <Text style={styles.feedMeta}>
          {pass ? 'Passa' : 'Não passa'} • {item.kind === 'pilot' ? 'Piloto' : 'Comunidade'}
        </Text>
      </View>
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
    <View style={styles.stackInner}>
      <TopBack title={title} subtitle={subtitle} onBack={onBack} />
      <View style={styles.formCard}>
        <View style={styles.hintBox}>
          <Icon name="navigate-circle-outline" size={20} color={tokens.color.brand} />
          <Text style={styles.hintText}>{locationHint}</Text>
        </View>
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Nome da comunidade" icon="business" />
        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Para quem é esta comunidade"
          icon="document"
        />
        <View style={styles.formRow}>
          <View style={styles.formCity}>
            <Input label="Cidade" value={city} onChangeText={setCity} placeholder="Barra Velha" icon="locate" />
          </View>
          <View style={styles.formUf}>
            <Input label="UF" value={stateUf} onChangeText={setStateUf} placeholder="SC" />
          </View>
        </View>
        {localError || error ? <Message tone="danger" text={localError || error} /> : null}
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
    </View>
  )
}

function CancelRequest({
  community,
  error,
  saving,
  onBack,
  onConfirm,
}: {
  community: Community
  error: string
  saving: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <View style={styles.stackInner}>
      <TopBack title="Cancelar pedido" subtitle={community.name} onBack={onBack} />
      <View style={styles.cancelCard}>
        <View style={styles.cancelIcon}>
          <Icon name="trash-outline" size={24} color={tokens.color.danger} />
        </View>
        <Text style={styles.cancelTitle}>Remover este pedido?</Text>
        <Text style={styles.cancelText}>
          Isso remove o pedido de "{community.name}". Você pode pedir de novo depois.
        </Text>
        {error ? <Message tone="danger" text={error} /> : null}
        <Button label="Voltar" variant="outline" disabled={saving} onPress={onBack} />
        <Button label="Sim, cancelar pedido" variant="danger" loading={saving} onPress={onConfirm} />
      </View>
    </View>
  )
}

function Hero({
  eyebrow,
  title,
  subtitle,
  icon,
  countLabel,
}: {
  eyebrow: string
  title: string
  subtitle: string
  icon: IconName
  countLabel?: string
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroIcon}>
        <Icon name={icon} size={26} color={tokens.color.onBrand} />
      </View>
      <View style={styles.heroCopy}>
        <View style={styles.heroHead}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          {countLabel ? (
            <View style={styles.heroCount}>
              <Text style={styles.heroCountText}>{countLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </View>
    </View>
  )
}

function TopBack({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <View style={styles.topBack}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        hitSlop={8}
        style={pressStyle(styles.backButton, { opacity: 0.75 })}
      >
        <Icon name="chevron-back" size={23} color={tokens.color.ink} />
      </Pressable>
      <View style={styles.cardCopy}>
        <Text style={styles.topTitle}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>
    </View>
  )
}

function StatusChip({ status, inverse = false }: { status: Community['status']; inverse?: boolean }) {
  const tone =
    status === 'approved'
      ? styles.chipApproved
      : status === 'pending'
        ? styles.chipPending
        : styles.chipRejected
  return (
    <View style={[styles.chip, tone, inverse ? styles.chipInverse : null]}>
      <Text style={styles.chipLabel}>{COMMUNITY_STATUS_LABEL[status]}</Text>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function Message({ tone, text }: { tone: 'success' | 'danger'; text: string }) {
  return (
    <View style={[styles.message, tone === 'success' ? styles.messageSuccess : styles.messageDanger]}>
      <Icon
        name={tone === 'success' ? 'checkmark-circle-outline' : 'warning-outline'}
        size={18}
        color={tone === 'success' ? tokens.color.pass : tokens.color.danger}
      />
      <Text style={styles.messageText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingTop: tokens.space[5],
    paddingBottom: tokens.space[8],
  },
  stackInner: {
    gap: tokens.space[4],
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
    padding: tokens.space[5],
    borderRadius: 22,
    backgroundColor: tokens.color.brand,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroCopy: {
    flex: 1,
    gap: tokens.space[1],
  },
  heroHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space[2],
  },
  eyebrow: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    textTransform: 'uppercase',
  },
  heroCount: {
    minWidth: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: tokens.space[2],
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroCountText: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  heroTitle: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.sign,
    fontSize: 30,
    lineHeight: 34,
  },
  heroSubtitle: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.label,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: tokens.space[3],
  },
  metric: {
    flex: 1,
    padding: tokens.space[3],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  metricValue: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
  metricLabel: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
  list: {
    gap: tokens.space[3],
  },
  listCard: {
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: 18,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  cardCopy: {
    flex: 1,
    gap: tokens.space[1],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
  },
  cardTitle: {
    flex: 1,
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: 17,
    lineHeight: 22,
  },
  systemBadge: {
    paddingHorizontal: tokens.space[2],
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    color: tokens.color.accentInk,
    backgroundColor: '#FFF7E8',
    fontFamily: tokens.font.label,
    fontSize: 11,
  },
  muted: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    lineHeight: 18,
  },
  sectionTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    padding: tokens.space[4],
  },
  empty: {
    alignItems: 'center',
    gap: tokens.space[2],
    padding: tokens.space[5],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  emptyTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
  emptyText: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    textAlign: 'center',
  },
  detailHero: {
    gap: tokens.space[4],
    padding: tokens.space[5],
    borderRadius: 22,
    backgroundColor: tokens.color.brand,
  },
  detailHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  detailTitle: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.sign,
    fontSize: 28,
    lineHeight: 32,
  },
  detailSubtitle: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.label,
    lineHeight: 20,
  },
  feedCard: {
    flexDirection: 'row',
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  feedIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedIconPass: {
    backgroundColor: '#ECFDF3',
  },
  feedIconDanger: {
    backgroundColor: '#FDECEB',
  },
  feedMeta: {
    color: tokens.color.brand,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  actionsGrid: {
    gap: tokens.space[3],
  },
  topBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  topTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.font.sign,
    fontSize: 26,
    lineHeight: 30,
  },
  formCard: {
    gap: tokens.space[4],
    padding: tokens.space[5],
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  formRow: {
    flexDirection: 'row',
    gap: tokens.space[3],
  },
  formCity: {
    flex: 1,
  },
  formUf: {
    width: 84,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
    padding: tokens.space[3],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.fog,
  },
  hintText: {
    flex: 1,
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    lineHeight: 19,
  },
  cancelCard: {
    alignItems: 'center',
    gap: tokens.space[4],
    padding: tokens.space[5],
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  cancelIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDECEB',
  },
  cancelTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: 20,
    textAlign: 'center',
  },
  cancelText: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.label,
    lineHeight: 20,
    textAlign: 'center',
  },
  message: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
    padding: tokens.space[3],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
  },
  messageSuccess: {
    borderColor: '#BFE5CB',
    backgroundColor: '#F0FDF4',
  },
  messageDanger: {
    borderColor: '#F1B9B4',
    backgroundColor: '#FDECEB',
  },
  messageText: {
    flex: 1,
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    lineHeight: 19,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: tokens.space[2],
    paddingVertical: tokens.space[1],
  },
  chipInverse: {
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: 11,
  },
})
