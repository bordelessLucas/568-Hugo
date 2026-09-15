import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SetupNotice } from './SetupNotice.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'

interface AppFrameProps {
  current: 'map' | 'profile' | 'settings' | 'community' | 'report'
  children: ReactNode
}

const NAV = [
  { id: 'map', label: 'Mapa', path: '/home' },
  { id: 'community', label: 'Comunidade', path: '/comunidade' },
  { id: 'settings', label: 'Configurações', path: '/configuracoes' },
] as const

const EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

export function AppFrame({ current, children }: AppFrameProps) {
  const navigate = useNavigate()
  const auth = useAuth()
  const settings = useSettings()
  const [open, setOpen] = useState(() => sessionStorage.getItem('rotatrucks-sidebar') !== 'closed')

  useEffect(() => {
    sessionStorage.setItem('rotatrucks-sidebar', open ? 'open' : 'closed')
  }, [open])
  const name = auth.session?.displayName?.trim() || auth.session?.email || 'Motorista'
  const plan = settings.plan === 'premium' ? 'Premium' : 'Gratuito'

  const go = (path: string) => {
    navigate(path)
    if (window.innerWidth < 1024) setOpen(false)
  }

  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-fog">
      {open ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-[#073049]/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="relative z-40 flex h-full shrink-0">
        <aside className="flex h-full w-14 shrink-0 flex-col bg-brand text-on-brand">
          <div className={['shrink-0', open ? 'h-[200px]' : 'h-28'].join(' ')} />

          <nav className="flex flex-col gap-1 px-1.5" aria-label="Atalhos">
            {NAV.map((item) => (
              <IconButton
                key={item.id}
                label={item.label}
                current={current === item.id}
                onClick={() => go(item.path)}
              >
                {item.id === 'map' ? (
                  <MapIcon />
                ) : item.id === 'community' ? (
                  <CommunityIcon />
                ) : (
                  <SettingsIcon />
                )}
              </IconButton>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/20 p-1.5">
            <button
              type="button"
              aria-label="Perfil"
              aria-current={current === 'profile' ? 'page' : undefined}
              title="Perfil"
              onClick={() => go('/perfil')}
              className={[
                'relative grid h-11 w-full place-items-center rounded-xl hover:bg-white/10',
                current === 'profile' ? 'bg-white/20' : '',
              ].join(' ')}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white font-body text-xs font-bold text-brand">
                {initials(name)}
              </span>
              {auth.truckPending ? (
                <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-white" aria-label="Pendente" />
              ) : null}
            </button>
          </div>
        </aside>

        <div
          className={[
            'absolute inset-y-0 left-14 z-40 overflow-hidden bg-brand text-on-brand transition-[width] lg:static',
            EASE,
            open ? 'w-[216px]' : 'w-0',
          ].join(' ')}
        >
          <div className="flex h-full w-[216px] flex-col">
            <div className="h-[200px] shrink-0" />
            <nav className="flex flex-col gap-1 pr-3" aria-label="Principal">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={current === item.id ? 'page' : undefined}
                  onClick={() => go(item.path)}
                  className={[
                    'h-11 rounded-xl px-3 text-left font-body text-sm font-bold',
                    current === item.id
                      ? 'bg-white/20 text-on-brand'
                      : 'text-on-brand-muted hover:bg-white/10 hover:text-on-brand',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto border-t border-white/20 p-3">
              <button
                type="button"
                onClick={() => go('/perfil')}
                className={[
                  'flex h-11 w-full items-center rounded-xl px-3 text-left hover:bg-white/10',
                  current === 'profile' ? 'bg-white/20' : '',
                ].join(' ')}
              >
                <span className="min-w-0">
                  <span className="block truncate font-body text-sm font-bold">{name}</span>
                  <span className="block truncate font-body text-[13px] text-on-brand-muted">{plan}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <img
          src="/logo.png"
          alt="RotaTrucks"
          className={[
            'pointer-events-none absolute z-50 object-contain transition-all',
            EASE,
            open
              ? 'top-10 h-24 w-24 max-lg:left-[88px] max-lg:translate-x-0 lg:left-1/2 lg:-translate-x-1/2'
              : 'top-[3.75rem] left-2 h-10 w-10 translate-x-0',
          ].join(' ')}
        />
        <button
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={[
            'absolute z-50 grid place-items-center rounded-xl text-on-brand hover:bg-white/10',
            EASE,
            open
              ? 'top-3 right-2 h-10 w-10 max-lg:right-auto max-lg:left-[220px]'
              : 'top-3 left-2 h-10 w-10',
          ].join(' ')}
        >
          <Chevron open={open} />
        </button>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {auth.truckPending ? <SetupNotice onConfigure={auth.openOnboarding} /> : null}
          {children}
        </div>
      </div>
    </div>
  )
}

function IconButton({
  label,
  current,
  onClick,
  children,
}: {
  label: string
  current: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      title={label}
      onClick={onClick}
      className={[
        'grid h-11 w-full place-items-center rounded-xl hover:bg-white/10',
        current ? 'bg-white/20 text-on-brand' : 'text-on-brand-muted',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M3 19c1.2-3 3.5-4.5 6-4.5S13.8 16 15 19" />
      <path d="M13 19c.7-2 2.2-3 4-3s3.2 1 4 3" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={['transition-transform', EASE, open ? '' : 'rotate-180'].join(' ')}
    >
      <path d="M15 6 L9 12 L15 18" />
    </svg>
  )
}

function initials(name: string): string {
  const parts = name.split(' ').filter((part) => part !== '')
  const first = parts[0]?.[0] ?? 'M'
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + second).toUpperCase()
}
