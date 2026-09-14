import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <aside className="relative hidden flex-col justify-between bg-brand px-14 py-12 text-on-brand xl:px-20 lg:flex">
        <img src="/logo.png?v=2" alt="RotaTrucks" className="h-44 w-44" />
        <div className="max-w-lg">
          <p className="font-sign text-5xl leading-[1.05] font-extrabold tracking-tight">
            A rota certa para o seu caminhão.
          </p>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-on-brand-muted">
            Veja se a via passa para o tipo, a altura e o peso do veículo antes de sair.
          </p>
        </div>
        <p className="text-sm text-on-brand-muted">Feito para quem dirige na estrada.</p>
      </aside>

      <main className="flex min-h-dvh flex-col bg-surface">
        <div className="flex items-center border-b border-line px-6 py-4 lg:hidden">
          <img src="/logo.png?v=2" alt="RotaTrucks" className="h-28 w-28" />
        </div>
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-start px-6 py-10 lg:justify-center lg:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
