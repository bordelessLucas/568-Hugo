interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  quiet?: boolean
}

const variantClass = {
  primary: 'bg-accent text-accent-ink hover:bg-[#e88c10]',
  secondary: 'bg-brand text-on-brand hover:bg-[#0067a6]',
  outline: 'border border-line bg-surface text-ink hover:bg-fog',
} as const

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  block = true,
  quiet = false,
}: ButtonProps) {
  const inactive = disabled || loading

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={inactive}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center rounded-xl font-body text-[15px] font-bold transition-colors',
        quiet
          ? 'h-auto bg-transparent px-0 text-brand hover:text-[#0067a6]'
          : 'h-12 px-5',
        quiet ? '' : block ? 'w-full' : 'w-auto',
        quiet ? '' : variantClass[variant],
        inactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      {loading ? 'Aguarde' : label}
    </button>
  )
}
