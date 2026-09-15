import { Ionicons } from '@expo/vector-icons'
import { tokens } from '@rotatrucks/back/tokens'

export type IconName = keyof typeof Ionicons.glyphMap

interface IconProps {
  name: IconName
  size?: number
  color?: string
}

export function Icon({ name, size = 22, color = tokens.color.ink }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />
}
