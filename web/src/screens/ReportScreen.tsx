import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { AppFrame } from '../components/AppFrame.tsx'
import { Button } from '../components/Button.tsx'
import { Body, Caption, Heading } from '../components/Typography.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'
import { useDeviceLocation } from '../hooks/useDeviceLocation.ts'
import { toUserMessage } from '../lib/auth-errors.ts'

const STATUS_LABEL: Record<ReportStatus, string> = {
  passa: 'Passa',
  nao_passa: 'Não passa',
}

export function ReportScreen() {
  const auth = useAuth()
  const settings = useSettings()
  const navigate = useNavigate()
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

  return (
    <AppFrame current="report">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 md:px-8">
          {done ? (
            <>
              <Heading>
                <span className="text-[28px] md:text-[32px]">Ocorrência salva</span>
              </Heading>
              <Body>A marcação ficou no banco e aparece na área de Comunidade.</Body>
              <Button label="Ver comunidade" onPress={() => navigate('/comunidade')} />
              <Button label="Voltar ao mapa" variant="outline" onPress={() => navigate('/home')} />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Heading>
                  <span className="text-[28px] md:text-[32px]">Marcar ocorrência</span>
                </Heading>
                <Body>Registre se a via passa ou não passa para o seu tipo de caminhão.</Body>
              </div>

              <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-5">
                <Caption>O que aconteceu?</Caption>
                <div className="grid gap-2 sm:grid-cols-2">
                  {REPORT_CATEGORIES.map((value) => (
                    <Choice
                      key={value}
                      label={REPORT_CATEGORY_OPTIONS[value].label}
                      hint={REPORT_CATEGORY_OPTIONS[value].description}
                      selected={category === value}
                      onSelect={() => setCategory(value)}
                    />
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-5">
                <Caption>Tipo de caminhão</Caption>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TRUCK_TYPES.map((value) => (
                    <Choice
                      key={value}
                      label={TRUCK_TYPE_OPTIONS[value].label}
                      selected={truckType === value}
                      onSelect={() => setTruckType(value)}
                    />
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-5">
                <Caption>Dá para seguir com o caminhão?</Caption>
                <div className="grid gap-2 sm:grid-cols-2">
                  {REPORT_STATUSES.map((value) => (
                    <Choice
                      key={value}
                      label={STATUS_LABEL[value]}
                      selected={status === value}
                      onSelect={() => setStatus(value)}
                    />
                  ))}
                </div>
              </section>

              <label className="flex flex-col gap-2">
                <Caption>Observações</Caption>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder={
                    reportCategoryRequiresNotes(category) || extreme
                      ? 'Descreva o risco em pelo menos 8 caracteres'
                      : 'Opcional'
                  }
                  className="rounded-xl border border-line bg-surface px-4 py-3 font-body text-sm text-ink outline-none focus:border-brand"
                />
              </label>

              <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-5">
                <Caption>Prioridade do aviso</Caption>
                <Choice
                  label="Urgência extrema"
                  hint="Só para risco imediato. Pode aparecer para quem está perto, mesmo sem destino. Não substitui polícia ou atendimento de emergência."
                  selected={extreme}
                  onSelect={() => setExtreme((value) => !value)}
                />
              </section>

              <p className="font-body text-[13px] text-muted">
                {location.status === 'ready'
                  ? 'Localização pronta para gravar o ponto.'
                  : location.status === 'denied'
                    ? 'Localização bloqueada.'
                    : 'Buscando localização…'}
              </p>
              {error ? (
                <p className="font-body text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                label="Salvar ocorrência"
                loading={saving}
                onPress={() => {
                  void save()
                }}
              />
              <Button label="Cancelar" variant="outline" onPress={() => navigate('/home')} />
            </>
          )}
        </div>
      </div>
    </AppFrame>
  )
}

function Choice({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string
  hint?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        'rounded-xl border px-4 py-3 text-left font-body text-sm font-bold',
        selected ? 'border-brand bg-fog text-ink' : 'border-line text-ink hover:bg-fog',
      ].join(' ')}
    >
      <span className="block">{label}</span>
      {hint ? <span className="mt-1 block text-[13px] font-normal text-muted">{hint}</span> : null}
    </button>
  )
}
