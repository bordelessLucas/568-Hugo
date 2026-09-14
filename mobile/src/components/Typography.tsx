import type { ReactNode } from 'react'
import { StyleSheet, Text } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'

interface TextProps {
  children: ReactNode
  tone?: 'ink' | 'muted' | 'inverse' | 'line'
}

export function Heading({ children, tone = 'ink' }: TextProps) {
  return <Text style={[styles.heading, { color: colorFor(tone) }]}>{children}</Text>
}

export function Body({ children, tone = 'ink' }: TextProps) {
  return <Text style={[styles.body, { color: colorFor(tone) }]}>{children}</Text>
}

export function Caption({ children, tone = 'muted' }: TextProps) {
  return <Text style={[styles.caption, { color: colorFor(tone) }]}>{children}</Text>
}

function colorFor(tone: NonNullable<TextProps['tone']>): string {
  if (tone === 'inverse') return tokens.color.onBrand
  if (tone === 'line') return tokens.color.onBrandMuted
  if (tone === 'muted') return tokens.color.muted
  return tokens.color.ink
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: tokens.font.sign,
    fontSize: tokens.size.title,
    lineHeight: 38,
  },
  body: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.body,
    lineHeight: 24,
  },
  caption: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    lineHeight: 18,
  },
})
