import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SAFETY_COMMAND_LABELS, type SafetyCommand, type SafetyMapMark } from '@rotatrucks/back'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon } from '@/components/Icon'

export function SafetyGuidanceCard({ mark, onClose }: { mark: SafetyMapMark; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const command: SafetyCommand = mark.kind === 'safe_place' ? 'SAFE_STOP' : mark.tone === 'danger' ? 'STOP' : mark.tone === 'warning' ? 'SLOW_DOWN' : 'RISK_AHEAD'
  return <View style={[styles.card, mark.tone === 'danger' ? styles.danger : mark.kind === 'safe_place' ? styles.safe : styles.warning]} accessibilityRole="alert">
    <View style={styles.head}><Icon name={mark.kind === 'safe_place' ? 'shield-checkmark' : 'warning'} size={28} color={tokens.color.onBrand} /><Text style={styles.command}>{SAFETY_COMMAND_LABELS[command]}</Text></View>
    <Text style={styles.title}>{mark.title}</Text>
    <Text style={styles.action}>{mark.badge}. Confira antes de continuar.</Text>
    <View style={styles.actions}><Pressable onPress={() => setExpanded((value) => !value)}><Text style={styles.link}>{expanded ? 'Ocultar detalhes' : 'Ver detalhes'}</Text></Pressable><Pressable onPress={onClose}><Text style={styles.link}>Entendi</Text></Pressable></View>
    {expanded ? <View style={styles.details}>{mark.details.map((detail) => <Text key={detail} style={styles.detail}>{detail}</Text>)}<Text style={styles.source}>{mark.sourceLabel}</Text></View> : null}
  </View>
}

const styles = StyleSheet.create({ card: { gap: 8, padding: 16, borderRadius: 18 }, danger: { backgroundColor: '#991B1B' }, warning: { backgroundColor: '#A15C00' }, safe: { backgroundColor: '#166534' }, head: { flexDirection: 'row', alignItems: 'center', gap: 9 }, command: { flex: 1, fontFamily: tokens.font.label, fontSize: 22, color: tokens.color.onBrand }, title: { fontFamily: tokens.font.label, fontSize: 16, color: tokens.color.onBrand }, action: { fontFamily: tokens.font.body, fontSize: 14, color: tokens.color.onBrand }, actions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }, link: { fontFamily: tokens.font.label, color: tokens.color.onBrand, textDecorationLine: 'underline' }, details: { gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.35)' }, detail: { fontFamily: tokens.font.body, fontSize: 13, color: tokens.color.onBrand }, source: { fontFamily: tokens.font.label, fontSize: 11, color: tokens.color.onBrand } })
