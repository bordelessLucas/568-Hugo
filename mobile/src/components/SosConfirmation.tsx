import { Pressable, Modal, StyleSheet, Text, View } from 'react-native'
import type { EmergencyProtocol, TrustedContact } from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'

interface Props { visible: boolean; protocol: EmergencyProtocol | null; contacts: TrustedContact[]; message: string; onCancel: () => void; onConfirm: () => void; onCallPrf: () => void; onAlertContacts: () => void; onCloseProtocol: () => void }

export function SosConfirmation(props: Props) {
  return <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onCancel}>
    <View style={styles.backdrop}><View style={styles.sheet} accessibilityViewIsModal>
      <View style={styles.icon}><Icon name="warning" size={34} color={tokens.color.onBrand} /></View>
      {props.protocol ? <>
        <Text style={styles.title}>SOS ATIVO</Text><Text style={styles.protocol}>Protocolo {props.protocol.id}</Text>
        <Text style={styles.body}>O evento foi registrado neste aparelho. Escolha como pedir ajuda agora.</Text>
        {!props.protocol.location ? <Text style={styles.warning}>GPS indisponível. O pedido será preparado sem localização.</Text> : null}
        <Button label="Ligar para PRF — 191" variant="danger" onPress={props.onCallPrf} />
        <Button label={`Avisar contatos (${props.contacts.length})`} onPress={props.onAlertContacts} disabled={props.contacts.length === 0} />
        {props.contacts.length === 0 ? <Text style={styles.help}>Cadastre contatos no Perfil. O SMS abre no aparelho para você confirmar o envio.</Text> : null}
        {props.message ? <Text style={styles.status}>{props.message}</Text> : null}
        <Button label="Encerrar SOS" variant="outline" onPress={props.onCloseProtocol} />
      </> : <>
        <Text style={styles.title}>Confirmar SOS?</Text>
        <Text style={styles.body}>Use somente em emergência real. Para ponte baixa, bloqueio ou risco na rota, siga a advertência do mapa.</Text>
        <Text style={styles.warning}>Este é o segundo toque. Ao confirmar, o aplicativo registra horário, caminhão e localização disponível.</Text>
        <Button label="CONFIRMAR SOS" variant="danger" onPress={props.onConfirm} />
        <Button label="Não é emergência" variant="outline" onPress={props.onCancel} />
      </>}
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={props.onCancel} style={styles.close}><Text style={styles.closeText}>Fechar</Text></Pressable>
    </View></View>
  </Modal>
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(8,20,32,0.72)' }, sheet: { gap: 14, borderRadius: 24, padding: 22, backgroundColor: tokens.color.surface },
  icon: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.color.danger }, title: { textAlign: 'center', fontFamily: tokens.font.label, fontSize: 26, color: tokens.color.ink }, protocol: { textAlign: 'center', fontFamily: tokens.font.label, fontSize: 12, color: tokens.color.muted },
  body: { fontFamily: tokens.font.body, fontSize: 16, lineHeight: 23, color: tokens.color.ink }, warning: { padding: 12, borderRadius: 12, fontFamily: tokens.font.label, fontSize: 14, lineHeight: 20, color: '#7F1D1D', backgroundColor: '#FEF2F2' }, help: { fontFamily: tokens.font.body, fontSize: 13, color: tokens.color.muted }, status: { fontFamily: tokens.font.label, fontSize: 13, color: tokens.color.brand }, close: { alignSelf: 'center', padding: 6 }, closeText: { fontFamily: tokens.font.label, color: tokens.color.muted },
})
