import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { pressStyle } from '@/lib/press'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'

  loading?: boolean
  disabled?: boolean
  block?: boolean
  /** Mantém espaço no layout mesmo invisível (ex.: Voltar no passo 1). */
  invisible?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  block = true,
  invisible = false,
}: ButtonProps) {
  const inactive = disabled || loading || invisible

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityElementsHidden={invisible}
      importantForAccessibility={invisible ? 'no-hide-descendants' : 'yes'}
      style={
        invisible
          ? [styles.base, styles[variant], block ? styles.block : styles.inline, styles.invisible]
          : pressStyle(
              [
                styles.base,
                styles[variant],
                block ? styles.block : styles.inline,
                inactive ? styles.inactive : null,
              ],
              {
                opacity: 0.95,
                pressed: pressedStyle(variant),
              },
            )
      }
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary'
              ? tokens.color.accentInk
              : variant === 'outline'
                ? tokens.color.ink
                : tokens.color.onBrand
          }
        />
      ) : (
        <Text style={[styles.label, { color: labelColor(variant) }]}>{label}</Text>
      )}
    </Pressable>
  )
}

function labelColor(variant: NonNullable<ButtonProps['variant']>): string {
  if (variant === 'primary') return tokens.color.accentInk
  if (variant === 'secondary' || variant === 'danger') return tokens.color.onBrand
  return tokens.color.ink
}

function pressedStyle(variant: NonNullable<ButtonProps['variant']>) {
  if (variant === 'primary') return styles.pressedPrimary
  if (variant === 'secondary') return styles.pressedSecondary
  if (variant === 'danger') return styles.pressedDanger
  return styles.pressedOutline
}

const styles = StyleSheet.create({
  base: {
    height: tokens.size.control,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.space[4],
  },
  block: {
    alignSelf: 'stretch',
  },
  inline: {
    alignSelf: 'flex-start',
  },
  inactive: {
    opacity: 0.45,
  },
  invisible: {
    opacity: 0,
  },
  primary: {
    backgroundColor: tokens.color.accent,
  },
  secondary: {
    backgroundColor: tokens.color.brand,
  },
  outline: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  danger: {
    backgroundColor: tokens.color.danger,
  },
  pressedPrimary: {
    backgroundColor: '#E8890F',
  },
  pressedSecondary: {
    backgroundColor: '#005F99',
  },
  pressedDanger: {
    backgroundColor: '#A02C23',
  },
  pressedOutline: {
    backgroundColor: tokens.color.fog,
  },
  label: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
})
