import { Pressable, Modal, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { pressStyle } from '@/lib/press'

interface MapLegendTutorialProps {
  visible: boolean
  onConfirm: () => void
}

export function MapLegendTutorial({ visible, onConfirm }: MapLegendTutorialProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <View style={styles.root}>
        <View style={styles.backdrop} />
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Icon name="information-circle-outline" size={28} color={tokens.color.brand} />
          </View>
          <Text style={styles.title}>Cores do mapa</Text>
          <Text style={styles.body}>
            Na primeira busca, vale saber o que cada cor significa:
          </Text>
          <LegendRow color={tokens.color.pass} label="Verde" detail="Trecho ou marcação que passa." />
          <LegendRow color={tokens.color.danger} label="Vermelho" detail="Trecho ou marcação que não passa." />
          <LegendRow color={tokens.color.brand} label="Azul" detail="Sua posição no mapa." />
          <Button label="Ok, entendi" onPress={onConfirm} />
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            style={pressStyle(styles.skipHit, { opacity: 0.7 })}
          >
            <Text style={styles.skip}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

function LegendRow({ color, label, detail }: { color: string; label: string; detail: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.copy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: tokens.space[5],
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,48,73,0.45)',
  },
  card: {
    gap: tokens.space[3],
    padding: tokens.space[5],
    borderRadius: 22,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  title: {
    fontFamily: tokens.font.sign,
    fontSize: 24,
    color: tokens.color.ink,
  },
  body: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.body,
    lineHeight: 22,
    color: tokens.color.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 99,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  rowDetail: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  skipHit: {
    alignSelf: 'stretch',
    paddingVertical: tokens.space[2],
  },
  skip: {
    textAlign: 'center',
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
})
