import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
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
          subtitle="Preferências locais neste aparelho."
          icon="settings-outline"
        />

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Icon name="card-outline" size={18} color={tokens.color.brand} />
            <Text style={styles.caption}>Assinatura</Text>
          </View>
          <Text style={styles.hint}>A cobrança não entra nesta versão.</Text>
          <View style={styles.row}>
            <Option
              icon="gift-outline"
              label="Gratuito"
              selected={settings.plan === 'gratuito'}
              onPress={() => settings.setPlan('gratuito')}
            />
            <Option
              icon="diamond-outline"
              label="Premium"
              selected={settings.plan === 'premium'}
              onPress={() => settings.setPlan('premium')}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Icon name="color-palette-outline" size={18} color={tokens.color.brand} />
            <Text style={styles.caption}>Aparência</Text>
          </View>
          <View style={styles.row}>
            <Option
              icon="sunny-outline"
              label="Claro"
              selected={settings.theme === 'light'}
              onPress={() => settings.setTheme('light')}
            />
            <Option
              icon="moon-outline"
              label="Escuro"
              selected={settings.theme === 'dark'}
              onPress={() => settings.setTheme('dark')}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Toggle
            icon="notifications-outline"
            label="Notificações"
            hint="Preferência local neste aparelho."
            value={settings.notifications}
            onChange={settings.setNotifications}
          />
          <Toggle
            icon="volume-high-outline"
            label="Sons do sistema"
            hint="Sons de aviso do aplicativo."
            value={settings.sounds}
            onChange={settings.setSounds}
          />
        </View>

        <View style={styles.card}>
          <Toggle
            icon="locate-outline"
            label="Usar localização"
            hint="Origem do mapa e distância até o destino."
            value={settings.shareLocation}
            onChange={settings.setShareLocation}
          />
          <Toggle
            icon="create-outline"
            label="Assinar marcações com o nome"
            hint="Ocorrências levam o nome da conta."
            value={settings.signReports}
            onChange={settings.setSignReports}
          />
        </View>
      </View>
    </Container>
  )
}

function Option({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: IconName
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected ? styles.optionOn : null]}>
      <Icon name={icon} size={18} color={selected ? tokens.color.brand : tokens.color.muted} />
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
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
  caption: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.brand,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.space[2],
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: tokens.color.line,
    borderRadius: tokens.radius.field,
    padding: tokens.space[3],
  },
  optionOn: {
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.fog,
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
