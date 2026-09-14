import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  block = true,
}: ButtonProps) {
  const inactive = disabled || loading
  const palette = styles[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[styles.base, palette, block ? styles.block : styles.inline, inactive && styles.inactive]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? tokens.color.accentInk : tokens.color.onBrand} />
      ) : (
        <Text style={[styles.label, { color: labelColor(variant) }]}>{label}</Text>
      )}
    </Pressable>
  )
}

function labelColor(variant: NonNullable<ButtonProps['variant']>): string {
  if (variant === 'primary') return tokens.color.accentInk
  if (variant === 'secondary') return tokens.color.onBrand
  return tokens.color.ink
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
    opacity: 0.5,
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
  label: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
})
