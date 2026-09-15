import { StyleSheet, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'

interface SetupNoticeProps {
  onConfigure: () => void
}

export function SetupNotice({ onConfigure }: SetupNoticeProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon name="bus-outline" size={22} color={tokens.color.brand} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Falta o caminhão</Text>
        <Text style={styles.body}>Sem veículo o mapa não filtra passa / não passa.</Text>
      </View>
      <Button label="Configurar" block={false} onPress={onConfigure} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    paddingHorizontal: tokens.space[3],
    paddingVertical: tokens.space[3],
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  body: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
})
