import { Pressable, StyleSheet, Text } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon } from '@/components/Icon'
import { pressStyle } from '@/lib/press'

export function SosButton({ onPress, active = false }: { onPress: () => void; active?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={active ? 'SOS ativo' : 'Abrir confirmação de SOS'} accessibilityHint="Exige confirmação antes de acionar" onPress={onPress} style={pressStyle([styles.button, active ? styles.active : null], { opacity: 0.9, pressed: styles.pressed })}>
    <Icon name="shield-outline" size={22} color={tokens.color.onBrand} />
    <Text style={styles.label}>{active ? 'SOS ATIVO' : 'SOS'}</Text>
  </Pressable>
}

const styles = StyleSheet.create({
  button: { minWidth: 104, height: 56, borderRadius: 28, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: tokens.color.danger, borderWidth: 3, borderColor: tokens.color.surface },
  active: { backgroundColor: '#7F1D1D' }, pressed: { transform: [{ scale: 0.97 }] }, label: { fontFamily: tokens.font.label, fontSize: 15, color: tokens.color.onBrand },
})
