import { Pressable, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon, type IconName } from '@/components/Icon'

interface IconFabProps {
  icon: IconName
  label: string
  onPress: () => void
  tone?: 'accent' | 'brand' | 'danger' | 'surface'
  accessibilityHint?: string
}

/** Rounded-square secondary action (Waze-style), not a primary full-width CTA. */
export function IconFab({
  icon,
  label,
  onPress,
  tone = 'accent',
  accessibilityHint,
}: IconFabProps) {
  const palette = toneStyles[tone]
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.fab, palette.fab, pressed ? styles.pressed : null]}
    >
      <Icon name={icon} size={26} color={palette.icon} />
      <Text style={[styles.caption, { color: palette.caption }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

interface IconChipProps {
  icon: IconName
  label: string
  onPress?: () => void
  active?: boolean
}

export function IconChip({ icon, label, onPress, active }: IconChipProps) {
  const content = (
    <View style={[styles.chip, active ? styles.chipOn : null]}>
      <Icon name={icon} size={16} color={active ? tokens.color.brand : tokens.color.ink} />
      <Text style={[styles.chipLabel, active ? styles.chipLabelOn : null]}>{label}</Text>
    </View>
  )
  if (!onPress) return content
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {content}
    </Pressable>
  )
}

const toneStyles = {
  accent: {
    fab: {
      backgroundColor: tokens.color.accent,
      shadowColor: '#1F1404',
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    icon: tokens.color.accentInk,
    caption: tokens.color.accentInk,
  },
  brand: {
    fab: { backgroundColor: tokens.color.brand },
    icon: tokens.color.onBrand,
    caption: tokens.color.onBrand,
  },
  danger: {
    fab: { backgroundColor: tokens.color.danger },
    icon: tokens.color.onBrand,
    caption: tokens.color.onBrand,
  },
  surface: {
    fab: {
      backgroundColor: tokens.color.surface,
      borderWidth: 1,
      borderColor: tokens.color.line,
    },
    icon: tokens.color.ink,
    caption: tokens.color.ink,
  },
} as const

const styles = StyleSheet.create({
  fab: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#073049',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  caption: {
    fontFamily: tokens.font.label,
    fontSize: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  chipOn: {
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.fog,
  },
  chipLabel: {
    fontFamily: tokens.font.label,
    fontSize: 12,
    color: tokens.color.ink,
  },
  chipLabelOn: {
    color: tokens.color.brand,
  },
})
