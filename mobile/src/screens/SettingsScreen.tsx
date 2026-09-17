import { StyleSheet, Switch, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Container } from '@/components/Container'
import { Icon, type IconName } from '@/components/Icon'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useSettings } from '@/contexts/SettingsContext'
import { useRouter } from 'expo-router'
import { Button } from '@/components/Button'

export function SettingsScreen() {
  const settings = useSettings()
  const router = useRouter()

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
          <Toggle
            icon="female-outline"
            label="Modo seguro feminino"
            hint="Prioriza pontos recomendados e mantém esta preferência privada neste aparelho."
            value={settings.womenSafeMode}
            onChange={settings.setWomenSafeMode}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Icon name="card-outline" size={18} color={tokens.color.brand} />
            <Text style={styles.optionLabel}>Escolha seu plano</Text>
          </View>
          <Plan label="Gratuito" hint="Mapa, avisos críticos, SOS, contatos e pontos seguros. Recursos essenciais de segurança continuam gratuitos." selected={settings.plan === 'gratuito'} onPress={() => settings.setPlan('gratuito')} />
          <Plan label="Premium" hint="Tudo do Gratuito, sem anúncios e com recursos avançados planejados. Cobrança ainda não ativada." selected={settings.plan === 'premium'} onPress={() => settings.setPlan('premium')} />
          <Plan label="Frotas" hint="Gestão de motoristas, veículos e relatórios planejados para empresas. Contratação ainda não ativada." selected={settings.plan === 'frotas'} onPress={() => settings.setPlan('frotas')} />
        </View>

        {settings.womenSafeMode ? <View style={styles.card}>
          <View style={styles.cardHead}><Icon name="shield-checkmark-outline" size={18} color={tokens.color.brand} /><Text style={styles.optionLabel}>Proteção para caminhoneiras</Text></View>
          <Text style={styles.hint}>Pânico silencioso usa o mesmo protocolo SOS sem expor publicamente a situação. Denúncia anônima e comunidade protegida serão conectadas ao backend em produção.</Text>
          <View style={styles.flow}><Text style={styles.flowTitle}>Pânico silencioso</Text><Text style={styles.hint}>Disponível pelo botão SOS no mapa, com confirmação.</Text></View>
          <Button label="Abrir pânico silencioso" variant="danger" onPress={() => router.push({ pathname: '/home', params: { sos: 'silent' } })} />
          <View style={styles.flow}><Text style={styles.flowTitle}>Denúncia anônima</Text><Text style={styles.hint}>Fluxo previsto; nenhum nome deve aparecer publicamente.</Text></View>
          <Button label="Registrar situação" variant="outline" onPress={() => router.push('/ocorrencia')} />
          <View style={styles.flow}><Text style={styles.flowTitle}>Comunidade de caminhoneiras</Text><Text style={styles.hint}>Espaço privado planejado, ainda sem publicação nesta versão.</Text></View>
          <Button label="Abrir comunidade" variant="outline" onPress={() => router.push('/comunidade')} />
        </View> : null}
      </View>
    </Container>
  )
}

function Plan({ label, hint, selected, onPress }: { label: string; hint: string; selected: boolean; onPress: () => void }) {
  return <View style={[styles.plan, selected ? styles.planOn : null]}><View style={{ flex: 1 }}><Text style={styles.optionLabel}>{label}</Text><Text style={styles.hint}>{hint}</Text></View><Text onPress={onPress} accessibilityRole="button" style={styles.select}>{selected ? 'Selecionado' : 'Escolher'}</Text></View>
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
  plan: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: tokens.color.line, borderRadius: 14 },
  planOn: { borderColor: tokens.color.brand, backgroundColor: tokens.color.fog },
  select: { fontFamily: tokens.font.label, color: tokens.color.brand, padding: 8 },
  flow: { gap: 3, paddingTop: 10, borderTopWidth: 1, borderTopColor: tokens.color.line },
  flowTitle: { fontFamily: tokens.font.label, color: tokens.color.ink },
})
