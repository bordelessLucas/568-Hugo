import { StyleSheet, Switch, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Container } from '@/components/Container'
import { Icon, type IconName } from '@/components/Icon'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useSettings } from '@/contexts/SettingsContext'

export function SettingsScreen() {
  const settings = useSettings()

  return (
    <Container edges={['top']}>
      <View style={styles.stack}>
        <ScreenHeader
          title="Ajustes"
          subtitle="Só o que já funciona neste aparelho."
          icon="settings-outline"
        />

        <View style={styles.card}>
          <Toggle
            icon="locate-outline"
            label="Usar localização"
            hint="Origem do mapa, avisos na rota e distância até o destino."
            value={settings.shareLocation}
            onChange={settings.setShareLocation}
          />
          <Toggle
            icon="phone-portrait-outline"
            label="Vibração nos avisos"
            hint="Aviso extremo no mapa vibra o aparelho (se o sistema permitir)."
            value={settings.sounds}
            onChange={settings.setSounds}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Icon name="time-outline" size={18} color={tokens.color.muted} />
            <Text style={styles.captionMuted}>Em breve</Text>
          </View>
          <Text style={styles.hint}>
            Tema, notificações push, sons e assinatura Premium ainda não estão ligados nesta
            versão — por isso não aparecem como opções ativas.
          </Text>
        </View>
      </View>
    </Container>
  )
}

function Toggle({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: IconName
  label: string
  hint: string
  value: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <View style={styles.toggle}>
      <View style={styles.toggleIcon}>
        <Icon name={icon} size={18} color={tokens.color.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: tokens.color.brand }} />
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingBottom: tokens.space[8],
  },
  card: {
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
  },
  captionMuted: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  optionLabel: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  hint: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
})
