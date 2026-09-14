import { useState, type ReactNode } from 'react'
import { AppFrame } from '../components/AppFrame.tsx'
import { Body, Caption, Heading } from '../components/Typography.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'

export function SettingsScreen() {
  const settings = useSettings()
  const [notice, setNotice] = useState('')

  return (
    <AppFrame current="settings">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 md:px-8">
          <div className="flex flex-col gap-2">
            <Heading>
              <span className="text-[28px] md:text-[32px]">Configurações</span>
            </Heading>
            <Body>Aparência, avisos e o modelo de assinatura desta conta.</Body>
          </div>

          <Section title="Assinatura" caption="A cobrança não entra nesta versão. A escolha fica salva neste aparelho.">
            <div className="grid gap-3 sm:grid-cols-2">
              <PlanCard
                label="Gratuito"
                hint="Mapa, caminhão e marcações da comunidade."
                selected={settings.plan === 'gratuito'}
                onSelect={() => settings.setPlan('gratuito')}
              />
              <PlanCard
                label="Premium"
                hint="Modelo sem anúncio, quando a assinatura existir."
                selected={settings.plan === 'premium'}
                onSelect={() => settings.setPlan('premium')}
              />
            </div>
          </Section>

          <Section title="Aparência">
            <div className="grid gap-3 sm:grid-cols-2">
              <PlanCard
                label="Claro"
                hint="Fundo claro, o padrão da marca."
                selected={settings.theme === 'light'}
                onSelect={() => settings.setTheme('light')}
              />
              <PlanCard
                label="Escuro"
                hint="Fundo escuro para dirigir à noite."
                selected={settings.theme === 'dark'}
                onSelect={() => settings.setTheme('dark')}
              />
            </div>
          </Section>

          <Section title="Avisos">
            <Toggle
              label="Notificações"
              hint="Alertas do navegador neste aparelho."
              checked={settings.notifications}
              onChange={(enabled) => {
                void settings.setNotifications(enabled).then(setNotice)
              }}
            />
            <Toggle
              label="Sons do sistema"
              hint="Sons de aviso do aplicativo."
              checked={settings.sounds}
              onChange={settings.setSounds}
            />
            {notice ? <p className="font-body text-sm text-danger">{notice}</p> : null}
          </Section>

          <Section title="Privacidade">
            <Toggle
              label="Usar localização"
              hint="Origem do mapa e distância até o destino."
              checked={settings.shareLocation}
              onChange={settings.setShareLocation}
            />
            <Toggle
              label="Assinar marcações com o nome"
              hint="Ocorrências futuras levam o nome da conta."
              checked={settings.signReports}
              onChange={settings.setSignReports}
            />
          </Section>
        </div>
      </div>
    </AppFrame>
  )
}

function Section({
  title,
  caption,
  children,
}: {
  title: string
  caption?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface px-5 py-5">
      <div>
        <Caption>{title}</Caption>
        {caption ? <p className="mt-1 font-body text-sm text-muted">{caption}</p> : null}
      </div>
      {children}
    </section>
  )
}

function PlanCard({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string
  hint: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        'rounded-xl border px-4 py-3 text-left',
        selected ? 'border-brand bg-fog' : 'border-line hover:bg-fog',
      ].join(' ')}
    >
      <span className="block font-body text-sm font-bold text-ink">{label}</span>
      <span className="mt-1 block font-body text-[13px] text-muted">{hint}</span>
    </button>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span>
        <span className="block font-body text-sm font-bold text-ink">{label}</span>
        <span className="mt-0.5 block font-body text-[13px] text-muted">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#0073b8]"
      />
    </label>
  )
}
