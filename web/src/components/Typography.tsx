import type { ReactNode } from 'react'

interface TextProps {
  children: ReactNode
}

export function Heading({ children }: TextProps) {
  return (
    <h1 className="font-sign text-[32px] leading-none font-extrabold tracking-tight text-ink md:text-[40px]">
      {children}
    </h1>
  )
}

export function Body({ children }: TextProps) {
  return <p className="font-body text-base leading-relaxed text-ink">{children}</p>
}

export function Caption({ children }: TextProps) {
  return <p className="font-body text-[13px] leading-snug text-muted">{children}</p>
}
