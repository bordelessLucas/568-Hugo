import { useState } from 'react'
import {
  GENDER_LABELS,
  TRUCK_AXLE_PROFILE,
  TRUCK_TYPES,
  TRUCK_TYPE_OPTIONS,
  dimensionWarnings,
  type TruckType,
} from '@rotatrucks/back'
import { AppFrame } from '../components/AppFrame.tsx'
import { Button } from '../components/Button.tsx'
import { Input } from '../components/Input.tsx'
import { Body, Caption, Heading } from '../components/Typography.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { toUserMessage } from '../lib/auth-errors.ts'
import { formatMeters, formatWeight, parseMeasure } from '../lib/measures.ts'

export function ProfileScreen() {
  const auth = useAuth()
  const profile = auth.profile
  const [adding, setAdding] = useState(false)
  const [selectingId, setSelectingId] = useState('')

  return (
    <AppFrame current="profile">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8 md:px-8">
          <div className="flex flex-col gap-2">
            <Heading>
              <span className="text-[28px] md:text-[32px]">Perfil</span>
            </Heading>
            <Body>Sua conta e os caminhões vinculados a ela. Outro caminhão não cria outro usuário.</Body>
          </div>

          <section className="rounded-2xl border border-line bg-surface px-5 py-5">
            <Caption>Conta</Caption>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info label="Nome" value={profile?.name || auth.session?.displayName || '—'} />
              <Info label="E-mail" value={profile?.email || auth.session?.email || '—'} />
              <Info label="Gênero" value={profile?.gender ? GENDER_LABELS[profile.gender] : 'Não informado'} />
              <Info label="Desde" value={formatDate(profile?.createdAt)} />
            </dl>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Caption>Caminhões</Caption>
                <p className="mt-1 font-body text-base text-ink">O mapa usa o caminhão marcado como em uso.</p>
              </div>
            </div>

            {auth.trucks.length === 0 ? (
              <p className="rounded-2xl border border-line bg-surface px-5 py-4 font-body text-sm text-muted">
                Nenhum caminhão nesta conta.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {auth.trucks.map((item) => {
                  const active = item.id === auth.truck?.id
                  const axle = TRUCK_AXLE_PROFILE[item.type]
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-body text-base font-bold text-ink">
                          {TRUCK_TYPE_OPTIONS[item.type].label}
                          {active ? ' · Em uso' : ''}
                        </p>
                        <p className="mt-1 font-body text-sm text-muted">
                          {formatMeters(item.heightMeters)} · {formatMeters(item.widthMeters)} ·{' '}
                          {formatMeters(item.lengthMeters)} · {formatWeight(item.totalWeightKg)}
                        </p>
                        <p className="mt-1 font-body text-[13px] text-muted">
                          {axle.axleCount} eixos
                          {axle.trailerCount > 0
                            ? axle.trailerCount === 1
                              ? ', 1 carreta'
                              : ', ' + axle.trailerCount + ' carretas'
                            : ''}
                        </p>
                      </div>
                      {active ? null : (
                        <Button
                          label="Usar este"
                          variant="outline"
                          block={false}
                          loading={selectingId === item.id}
                          onPress={() => {
                            setSelectingId(item.id)
                            void auth.selectTruck(item.id).finally(() => setSelectingId(''))
                          }}
                        />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {adding ? (
              <AddTruckForm
                onCancel={() => setAdding(false)}
                onSave={async (draft) => {
                  await auth.addTruck(draft)
                  setAdding(false)
                }}
              />
            ) : (
              <Button label="Adicionar caminhão" onPress={() => setAdding(true)} />
            )}
          </section>

          <div className="pb-6">
            <Button
              label="Sair"
              variant="outline"
              onPress={() => {
                void auth.signOut()
              }}
            />
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-[13px] text-muted">{label}</dt>
      <dd className="mt-1 font-body text-base font-bold text-ink">{value}</dd>
    </div>
  )
}

function AddTruckForm({
  onCancel,
  onSave,
}: {
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
  const [type, setType] = useState<TruckType | null>(null)
  const [height, setHeight] = useState('')
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [weightTons, setWeightTons] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const heightMeters = parseMeasure(height)
  const widthMeters = parseMeasure(width)
  const lengthMeters = parseMeasure(length)
  const tons = parseMeasure(weightTons)
  const warnings =
    heightMeters && widthMeters && lengthMeters && tons
      ? dimensionWarnings({
          heightMeters,
          widthMeters,
          lengthMeters,
          totalWeightKg: Math.round(tons * 1000),
        })
      : []

  const save = async () => {
    setError('')
    if (!auth.session) {
      setError('Entre na conta para salvar o caminhão.')
      return
    }
    if (!type) {
      setError('Escolha o tipo de caminhão.')
      return
    }
    if (heightMeters === null || widthMeters === null || lengthMeters === null || tons === null) {
      setError('Informe altura, largura, comprimento e peso total.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        userId: auth.session.uid,
        type,
        heightMeters,
        widthMeters,
        lengthMeters,
        totalWeightKg: Math.round(tons * 1000),
      })
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface px-5 py-5"
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <div>
        <p className="font-body text-base font-bold text-ink">Novo caminhão</p>
        <p className="mt-1 font-body text-sm text-muted">
          Fica na mesma conta. O mapa passa a usar este veículo.
        </p>
      </div>

      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-2 font-body text-sm font-semibold text-ink">Tipo</legend>
        {TRUCK_TYPES.map((value) => {
          const active = value === type
          return (
            <label
              key={value}
              className={[
                'flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3',
                active ? 'border-brand bg-fog' : 'border-line',
              ].join(' ')}
            >
              <span>
                <span className="block font-body text-sm font-bold text-ink">
                  {TRUCK_TYPE_OPTIONS[value].label}
                </span>
                <span className="block font-body text-[13px] text-muted">
                  {TRUCK_TYPE_OPTIONS[value].hint}
                </span>
              </span>
              <input
                type="radio"
                name="tipo"
                checked={active}
                onChange={() => setType(value)}
                className="h-4 w-4 accent-[#0073b8]"
              />
            </label>
          )
        })}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Altura (m)" value={height} onChangeText={setHeight} placeholder="4,20" inputMode="decimal" />
        <Input label="Largura (m)" value={width} onChangeText={setWidth} placeholder="2,60" inputMode="decimal" />
        <Input label="Comprimento (m)" value={length} onChangeText={setLength} placeholder="18,60" inputMode="decimal" />
        <Input label="Peso total (t)" value={weightTons} onChangeText={setWeightTons} placeholder="32" inputMode="decimal" />
      </div>

      {warnings.map((note) => (
        <p key={note} className="font-body text-[13px] text-ink">
          {note} Dá para salvar, mas a via pode não passar.
        </p>
      ))}
      {error ? (
        <p className="font-body text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button label="Cancelar" variant="outline" block={false} disabled={saving} onPress={onCancel} />
        <Button
          label="Salvar caminhão"
          block={false}
          loading={saving}
          onPress={() => {
            void save()
          }}
        />
      </div>
    </form>
  )
}

function formatDate(value: string | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}
