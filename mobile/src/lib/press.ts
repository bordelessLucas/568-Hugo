import type { PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native'

/** Feedback de toque sem mudar layout (sem scale que empurra vizinhos). */
export function pressStyle(
  base: StyleProp<ViewStyle>,
  options?: {
    pressed?: StyleProp<ViewStyle>
    opacity?: number
  },
): (state: PressableStateCallbackType) => StyleProp<ViewStyle> {
  const opacity = options?.opacity ?? 0.92
  return ({ pressed }) => [base, pressed ? { opacity } : null, pressed ? options?.pressed : null]
}

/** Hitbox fixa: scale visual só no miolo, caixa externa estável. */
export function pressScaleInner(pressed: boolean): ViewStyle {
  return pressed ? { transform: [{ scale: 0.96 }], opacity: 0.9 } : { transform: [{ scale: 1 }], opacity: 1 }
}
