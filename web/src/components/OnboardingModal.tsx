import { useEffect, useRef } from 'react'
import { GENDERS, GENDER_LABELS, TRUCK_TYPES, TRUCK_TYPE_OPTIONS } from '@rotatrucks/back'
import { Button } from './Button.tsx'
import { Input } from './Input.tsx'
import { Body, Caption } from './Typography.tsx'
import { ONBOARDING_STEPS, useOnboardingForm } from '../hooks/useOnboardingForm.ts'

const STEP_LABELS = ['Gênero', 'Caminhão', 'Medidas'] as const

export function OnboardingModal() {
  const form = useOnboardingForm()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#073049]/45 p-3 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-title"
        tabIndex={-1}
        className="onboarding-pop flex max-h-[min(760px,100%)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <Caption>Configuração inicial</Caption>
            <p className="mt-1 font-body text-sm font-bold text-ink">
              Passo {form.stepIndex + 1} de {ONBOARDING_STEPS.length}
            </p>
          </div>
          <ol className="flex items-center gap-2" aria-label="Etapas">
            {STEP_LABELS.map((label, index) => (
              <li
                key={label}
                className={[
                  'h-1.5 w-8 rounded-full',
                  index <= form.stepIndex ? 'bg-brand' : 'bg-line',
                ].join(' ')}
              >
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div
            key={form.step}
            className={form.direction === 'back' ? 'onboarding-back' : 'onboarding-forward'}
          >
            <h2 id="setup-title" className="font-sign text-[28px] leading-none font-extrabold tracking-tight text-ink">
              {form.copy.title}
            </h2>
            <div className="mt-3">
              <Body>{form.copy.body}</Body>
            </div>

            <div className="mt-6">
              {form.step === 'gender' ? (
                <ChoiceList
                  name="genero"
                  options={GENDERS.map((value) => ({
                    value,
                    label: GENDER_LABELS[value],
                    hint: value === 'nao_informado' ? 'O perfil segue sem essa informação.' : '',
                  }))}
                  selected={form.gender}
                  onSelect={form.setGender}
                />
              ) : null}

              {form.step === 'truck' ? (
                <ChoiceList
                  name="caminhao"
                  options={TRUCK_TYPES.map((value) => ({
                    value,
                    label: TRUCK_TYPE_OPTIONS[value].label,
                    hint: TRUCK_TYPE_OPTIONS[value].hint,
                  }))}
                  selected={form.truckType}
                  onSelect={form.setTruckType}
                />
              ) : null}

              {form.step === 'measures' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Altura (m)" value={form.height} onChangeText={form.setHeight} placeholder="4,20" inputMode="decimal" hint="Limite citado: 4,40 m" />
                  <Input label="Largura (m)" value={form.width} onChangeText={form.setWidth} placeholder="2,60" inputMode="decimal" hint="Limite citado: 2,60 m" />
                  <Input label="Comprimento (m)" value={form.length} onChangeText={form.setLength} placeholder="18,60" inputMode="decimal" hint="Limite citado: 19,80 m" />
                  <Input label="Peso total (t)" value={form.weightTons} onChangeText={form.setWeightTons} placeholder="32" inputMode="decimal" hint="Em toneladas" />
                </div>
              ) : null}
            </div>

            {form.warnings.length > 0 && form.step === 'measures' ? (
              <ul className="mt-4 flex flex-col gap-1">
                {form.warnings.map((note) => (
                  <li key={note} className="font-body text-[13px] text-ink">
                    {note} Dá para salvar.
                  </li>
                ))}
              </ul>
            ) : null}

            {form.fieldError ? (
              <p className="mt-4 font-body text-sm text-danger" role="alert">
                {form.fieldError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            label="Pular por agora"
            quiet
            block={false}
            disabled={form.busy}
            onPress={() => {
              void form.skip()
            }}
          />
          <div className="flex gap-3">
            {form.step !== 'gender' ? (
              <Button label="Voltar" variant="outline" block={false} disabled={form.busy} onPress={form.goBack} />
            ) : null}
            <Button
              label={form.step === 'measures' ? 'Salvar caminhão' : 'Continuar'}
              block={false}
              loading={form.saving}
              disabled={form.skipping}
              onPress={() => {
                void form.goNext()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChoiceList<T extends string>({
  name,
  options,
  selected,
  onSelect,
}: {
  name: string
  options: Array<{ value: T; label: string; hint: string }>
  selected: T | null
  onSelect: (value: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{name}</legend>
      {options.map((option) => {
        const active = option.value === selected
        return (
          <label
            key={option.value}
            className={[
              'flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
              active ? 'border-brand bg-fog' : 'border-line bg-surface hover:bg-fog',
            ].join(' ')}
          >
            <span>
              <span className="block font-body text-base font-bold text-ink">{option.label}</span>
              {option.hint ? (
                <span className="mt-0.5 block font-body text-[13px] text-muted">{option.hint}</span>
              ) : null}
            </span>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onSelect(option.value)}
              className="h-4 w-4 accent-[#0073b8]"
            />
          </label>
        )
      })}
    </fieldset>
  )
}
