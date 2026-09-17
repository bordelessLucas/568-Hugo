import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TrustedContact } from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Input } from '@/components/Input'
import { ScreenHeader } from '@/components/ScreenHeader'
import { loadTrustedContacts, saveTrustedContacts } from '@/lib/emergency'
import { useAuth } from '@/contexts/AuthContext'

export function TrustedContactsScreen() {
  const auth = useAuth()
  const userId = auth.session?.uid ?? 'local-user'
  const [contacts, setContacts] = useState<TrustedContact[]>([]), [name, setName] = useState(''), [phone, setPhone] = useState(''), [error, setError] = useState('')
  useEffect(() => { void loadTrustedContacts(userId).then(setContacts) }, [userId])
  const persist = async (next: TrustedContact[]) => { setError(''); try { await saveTrustedContacts(userId, next); setContacts(next); return true } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível salvar.'); return false } }
  return <Container><View style={styles.stack}>
    <ScreenHeader title="Contatos de confiança" subtitle="Até três pessoas que podem receber um SMS preparado durante um SOS." icon="people-outline" />
    <View style={styles.notice}><Text style={styles.noticeText}>O envio automático dependerá do backend de produção. Nesta versão, o app abre o SMS no celular para você confirmar.</Text></View>
    {contacts.map((contact) => <View key={contact.id} style={styles.card}><View style={{ flex: 1 }}><Text style={styles.name}>{contact.name}</Text><Text style={styles.phone}>{contact.phone}</Text></View><Button label="Remover" variant="outline" block={false} onPress={() => void persist(contacts.filter((item) => item.id !== contact.id))} /></View>)}
    {contacts.length < 3 ? <View style={styles.form}><Text style={styles.section}>Adicionar contato</Text><Input label="Nome" value={name} onChangeText={setName} placeholder="Ex.: Ana Souza" /><Input label="Telefone com DDI" value={phone} onChangeText={setPhone} placeholder="+5547999999999" />{error ? <Text style={styles.error}>{error}</Text> : null}<Button label="Salvar contato" onPress={() => { const next = [...contacts, { id: `contact-${Date.now()}`, name: name.trim(), phone: phone.replace(/[\s()-]/g, '') }]; void persist(next).then((saved) => { if (saved) { setName(''); setPhone('') } }) }} /></View> : <Text style={styles.limit}>Limite de três contatos atingido.</Text>}
  </View></Container>
}

const styles = StyleSheet.create({ stack: { gap: 16, paddingTop: 12 }, notice: { padding: 14, borderRadius: 14, backgroundColor: '#FFF7E8' }, noticeText: { fontFamily: tokens.font.body, fontSize: 13, lineHeight: 19, color: tokens.color.ink }, card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, borderColor: tokens.color.line, borderRadius: 16, backgroundColor: tokens.color.surface }, name: { fontFamily: tokens.font.label, fontSize: 16, color: tokens.color.ink }, phone: { fontFamily: tokens.font.body, color: tokens.color.muted }, form: { gap: 14, padding: 16, borderWidth: 1, borderColor: tokens.color.line, borderRadius: 16, backgroundColor: tokens.color.surface }, section: { fontFamily: tokens.font.label, fontSize: 17, color: tokens.color.ink }, error: { fontFamily: tokens.font.body, color: tokens.color.danger }, limit: { fontFamily: tokens.font.label, color: tokens.color.muted } })
