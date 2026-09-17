import { useEffect, useState } from 'react'
import {
  REPORT_CATEGORY_OPTIONS,
  COMMUNITY_STATUS_LABEL,
  createCommunity,
  deletePendingCommunity,
  loadCommunityDetail,
  listVisibleCommunities,
  updatePendingCommunity,
  type Community,
  type CommunityFeedItem,
} from '@rotatrucks/back'
import { AppFrame } from '../components/AppFrame.tsx'
import { Button } from '../components/Button.tsx'
import { Input } from '../components/Input.tsx'
import { Body, Caption, Heading } from '../components/Typography.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'
import { useDeviceLocation } from '../hooks/useDeviceLocation.ts'
import { toUserMessage } from '../lib/auth-errors.ts'

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
      setCommunities(await listVisibleCommunities(auth.session.uid))
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

  return (
    <AppFrame current="community">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 md:px-8">
          {mode === 'list' ? (
            <>
              <div className="flex flex-col gap-2">
                <Heading>
                  <span className="text-[28px] md:text-[32px]">Comunidade</span>
                </Heading>
                <Body>
                  Veja marcações da região ou peça uma comunidade nova. Pedidos passam por um
                  administrador.
                </Body>
              </div>
              {notice ? <p className="font-body text-sm text-pass">{notice}</p> : null}
              {error ? (
                <p className="font-body text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              {loading ? <p className="font-body text-sm text-muted">Carregando…</p> : null}
              {!loading && communities.length === 0 ? (
                <p className="rounded-2xl border border-line bg-surface px-5 py-4 font-body text-sm text-muted">
                  Ainda não há comunidades na sua lista. Você pode pedir a primeira abaixo.
                </p>
              ) : null}
              <ul className="flex flex-col gap-3">
                {communities.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 text-left"
                      onClick={() => {
                        void openDetail(item)
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block font-body text-base font-bold text-ink">{item.name}</span>
                        <span className="mt-1 block font-body text-sm text-muted">
                          {item.city}/{item.state}
                        </span>
                        <StatusChip status={item.status} />
                      </span>
                      <span className="shrink-0 font-body text-sm text-brand">Abrir</span>
                    </button>
                  </li>
                ))}
              </ul>
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
              initial={null}
              defaultPoint={location.point ?? DEFAULT_POINT}
              locationHint={
                location.point
                  ? 'Vamos usar sua localização atual no pedido.'
                  : 'Sem GPS agora: usamos o ponto padrão da região piloto (Barra Velha / SC).'
              }
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
              initial={selected}
              defaultPoint={{ latitude: selected.latitude, longitude: selected.longitude }}
              locationHint="O ponto do pedido continua o mesmo, salvo se você estiver com GPS e criar de novo."
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
            <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface px-5 py-5">
              <Caption>Cancelar pedido?</Caption>
              <Body>
                Isso remove o pedido de “{selected.name}”. Você pode pedir de novo depois.
              </Body>
              {error ? (
                <p className="font-body text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  label="Voltar"
                  variant="secondary"
                  block={false}
                  disabled={saving}
                  onPress={() => {
                    setError('')
                    setMode('detail')
                  }}
                />
                <Button
                  label="Sim, cancelar pedido"
                  variant="outline"
                  block={false}
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
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </AppFrame>
  )
}

function StatusChip({ status }: { status: Community['status'] }) {
  const tone =
    status === 'approved'
      ? 'bg-[#e8f6ee] text-pass'
      : status === 'pending'
        ? 'bg-[#fff4e5] text-accent-ink'
        : 'bg-[#fdeceb] text-danger'
  return (
    <span className={['mt-2 inline-flex rounded-full px-2.5 py-1 font-body text-[12px] font-bold', tone].join(' ')}>
      {COMMUNITY_STATUS_LABEL[status]}
    </span>
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
    <div className="flex flex-col gap-5">
      {notice ? <p className="font-body text-sm text-pass">{notice}</p> : null}
      <div>
        <Heading>
          <span className="text-[28px] md:text-[32px]">{community.name}</span>
        </Heading>
        <p className="mt-2 font-body text-sm text-muted">
          {community.city}/{community.state}
        </p>
        <StatusChip status={community.status} />
        <div className="mt-3">
          <Body>{community.description}</Body>
        </div>
      </div>
      <Caption>Marcações e ocorrências próximas</Caption>
      {feed.length === 0 ? (
        <p className="font-body text-sm text-muted">Ainda não há marcações nesta região.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {feed.map((item) => (
            <li key={item.id} className="rounded-2xl border border-line bg-surface px-5 py-4">
              <p className="font-body text-base font-bold text-ink">
                <span className={item.status === 'passa' ? 'text-pass' : 'text-danger'}>
                  {item.status === 'passa' ? '● Passa' : '● Não passa'}
                </span>
                {' · '}
                {item.label}
              </p>
              <p className="mt-1 font-body text-xs font-bold text-brand">
                {REPORT_CATEGORY_OPTIONS[item.category].label}
              </p>
              <p className="mt-1 font-body text-sm text-muted">{item.notes}</p>
            </li>
          ))}
        </ul>
      )}
      {canManage ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button label="Editar pedido" variant="outline" onPress={onEdit} />
          <Button label="Cancelar pedido" variant="outline" onPress={onCancelRequest} />
        </div>
      ) : null}
      <Button label="Voltar para a lista" onPress={onBack} />
    </div>
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

  const submit = () => {
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
  }

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface px-5 py-5"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div>
        <p className="font-body text-base font-bold text-ink">{title}</p>
        <p className="mt-1 font-body text-sm text-muted">{subtitle}</p>
        <p className="mt-2 font-body text-[13px] text-muted">{locationHint}</p>
      </div>
      <Input label="Nome" value={name} onChangeText={setName} placeholder="Nome da comunidade" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Para quem é esta comunidade"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Cidade" value={city} onChangeText={setCity} placeholder="Barra Velha" />
        <Input label="UF" value={stateUf} onChangeText={setStateUf} placeholder="SC" />
      </div>
      {localError || error ? (
        <p className="font-body text-sm text-danger" role="alert">
          {localError || error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button label="Voltar" variant="outline" block={false} disabled={saving} onPress={onBack} />
        <Button label={submitLabel} block={false} loading={saving} onPress={submit} />
      </div>
    </form>
  )
}
