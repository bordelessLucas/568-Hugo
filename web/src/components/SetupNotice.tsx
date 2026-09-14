import { Button } from './Button.tsx'

interface SetupNoticeProps {
  onConfigure: () => void
}

export function SetupNotice({ onConfigure }: SetupNoticeProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 border-b border-l-4 border-line border-l-brand bg-surface px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8"
    >
      <div className="min-w-0">
        <p className="font-body text-sm font-bold text-ink">Falta configurar o caminhão</p>
        <p className="mt-1 font-body text-sm text-muted">
          Sem o veículo, o mapa não filtra passa e não passa. O aviso fica aqui até o cadastro.
        </p>
      </div>
      <Button label="Configurar agora" block={false} onPress={onConfigure} />
    </div>
  )
}
