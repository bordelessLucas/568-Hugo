import { useId, useState } from 'react'

interface InputProps {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  error?: string
  hint?: string
  secure?: boolean
  icon?: 'mail' | 'lock' | 'user'
  type?: 'text' | 'email'
  inputMode?: 'text' | 'decimal' | 'email'
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secure = false,
  icon,
  type = 'text',
  inputMode,
}: InputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [visible, setVisible] = useState(false)
  const inputType = secure ? (visible ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-body text-sm font-semibold text-ink">
        {label}
      </label>
      <div
        className={[
          'flex h-12 items-center gap-3 rounded-xl border bg-surface px-3 transition-colors focus-within:border-brand',
          error ? 'border-danger' : 'border-line',
        ].join(' ')}
      >
        {icon ? <FieldIcon name={icon} /> : null}
        <input
          id={id}
          value={value}
          type={inputType}
          placeholder={placeholder}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? `${id}-hint` : undefined}
          onChange={(event) => onChangeText(event.target.value)}
          className="h-full w-full bg-transparent font-body text-base text-ink outline-none placeholder:text-muted"
        />
        {secure ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="font-body text-[13px] font-semibold text-muted"
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="font-body text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="font-body text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function FieldIcon({ name }: { name: 'mail' | 'lock' | 'user' }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    className: 'shrink-0 text-muted',
    'aria-hidden': true,
  } as const

  if (name === 'mail') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    )
  }

  if (name === 'lock') {
    return (
      <svg {...common}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" />
    </svg>
  )
}

