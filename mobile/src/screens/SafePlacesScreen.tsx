import { filterSafePlaces, formatSafePlaceServices, hasWomenFriendlySeal, listSafePlaces, rankSafePlaces, type SafePlace, type SafePlaceService, type SafePlaceSort } from '@rotatrucks/back'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import * as Linking from 'expo-linking'
import { tokens } from '@rotatrucks/back/tokens'
import { Container } from '@/components/Container'
import { Body, Caption, Heading } from '@/components/Typography'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { pressStyle } from '@/lib/press'

const filters: Array<{ value: SafePlaceService; label: string }> = [{ value: 'truck_parking', label: 'Estacionamento' }, { value: 'lighting', label: 'Iluminação' }, { value: 'security', label: 'Segurança' }, { value: 'restroom', label: 'Banheiro' }, { value: 'shower', label: 'Chuveiro' }, { value: 'food', label: 'Comida' }, { value: 'repair', label: 'Oficina' }, { value: 'overnight', label: 'Pernoite' }]
const sorts: Array<{ value: SafePlaceSort; label: string }> = [{ value: 'distance', label: 'Mais perto' }, { value: 'rating', label: 'Melhor nota' }, { value: 'structure', label: 'Mais estrutura' }]

export function SafePlacesScreen() {
  const settings = useSettings(), location = useDeviceLocation(settings.shareLocation)
  const [items, setItems] = useState<SafePlace[]>([]), [loading, setLoading] = useState(true), [query, setQuery] = useState(''), [services, setServices] = useState<SafePlaceService[]>([]), [sort, setSort] = useState<SafePlaceSort>('distance'), [selected, setSelected] = useState('')
  useEffect(() => { void listSafePlaces().then(setItems).finally(() => setLoading(false)) }, [])
  const places = useMemo(() => rankSafePlaces(filterSafePlaces(items, { query, services, womenRecommended: settings.womenSafeMode }), location.point, sort), [items, query, services, settings.womenSafeMode, location.point, sort])
  return <Container edges={['top']}><View style={styles.stack}>
    <View style={styles.header}><Heading>Pontos seguros</Heading><Body>Encontre estrutura para o caminhão e confira os detalhes antes de parar.</Body></View>
    <TextInput value={query} onChangeText={setQuery} placeholder="Buscar por nome ou endereço" placeholderTextColor={tokens.color.muted} style={styles.search} />
    <View style={styles.chips}>{filters.map((filter) => <Chip key={filter.value} label={filter.label} active={services.includes(filter.value)} onPress={() => setServices((current) => current.includes(filter.value) ? current.filter((item) => item !== filter.value) : [...current, filter.value])} />)}</View>
    <View style={styles.chips}>{sorts.map((item) => <Chip key={item.value} label={item.label} active={sort === item.value} onPress={() => setSort(item.value)} />)}</View>
    {settings.womenSafeMode ? <Text style={styles.private}>Modo feminino ativo: exibindo locais recomendados para caminhoneiras. Esta preferência fica somente no aparelho.</Text> : null}
    {location.status !== 'ready' && sort === 'distance' ? <Caption>Distância indisponível; exibindo a ordem cadastrada.</Caption> : null}
    {loading ? <Caption>Carregando pontos seguros…</Caption> : null}
    {!loading && places.length === 0 ? <Caption>Nenhum ponto corresponde aos filtros.</Caption> : null}
    {places.map((place) => <Pressable key={place.id} onPress={() => setSelected(selected === place.id ? '' : place.id)} style={pressStyle(styles.card, { opacity: 0.94 })}>
      <View style={styles.row}><Text style={styles.title}>{place.name}</Text><Text style={styles.score}>{place.ratingAverage.toFixed(1)} ★</Text></View>
      {hasWomenFriendlySeal(place) ? <Text style={styles.seal}>Ponto Amigo da Caminhoneira</Text> : null}
      <Body>{formatSafePlaceServices(place)}</Body><Caption>{place.ratingCount} avaliações · Toque para detalhes</Caption>
      {selected === place.id ? <View style={styles.details}>{place.address ? <Text style={styles.detail}>Endereço: {place.address}</Text> : null}{place.openingHours ? <Text style={styles.detail}>Funcionamento: {place.openingHours}</Text> : null}<Text style={styles.detail}>Recomendado pela estrutura informada e pela avaliação da comunidade.</Text><View style={styles.detailActions}><Text accessibilityRole="link" onPress={() => void Linking.openURL(`https://maps.google.com/?q=${place.latitude},${place.longitude}`)} style={styles.action}>Ver no mapa</Text><Text accessibilityRole="link" onPress={() => void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`)} style={styles.action}>Traçar rota</Text></View><Text style={styles.simulated}>{place.origin === 'demo' ? 'Dado simulado para teste' : `Cadastro verificado em ${place.verifiedAt ?? 'data não informada'}`}</Text><Text style={styles.warning}>As condições podem mudar. Confirme o local antes de parar.</Text></View> : null}
    </Pressable>)}
  </View></Container>
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={pressStyle([styles.chip, active ? styles.chipOn : null], { opacity: 0.85 })}><Text style={[styles.chipText, active ? styles.chipTextOn : null]}>{label}</Text></Pressable> }
const styles = StyleSheet.create({ stack: { gap: 12, paddingBottom: 30 }, header: { gap: 8, marginTop: 20 }, search: { height: 52, borderWidth: 1, borderColor: tokens.color.line, borderRadius: 14, paddingHorizontal: 16, backgroundColor: tokens.color.surface, fontFamily: tokens.font.body, color: tokens.color.ink }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: tokens.color.line, backgroundColor: tokens.color.surface }, chipOn: { backgroundColor: tokens.color.brand, borderColor: tokens.color.brand }, chipText: { fontFamily: tokens.font.label, fontSize: 12, color: tokens.color.ink }, chipTextOn: { color: tokens.color.onBrand }, private: { padding: 12, borderRadius: 12, backgroundColor: '#F0FDF4', fontFamily: tokens.font.body, fontSize: 13, color: tokens.color.ink }, card: { gap: 8, backgroundColor: tokens.color.surface, borderColor: tokens.color.line, borderWidth: 1, borderRadius: 16, padding: 16 }, row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, title: { flex: 1, fontFamily: tokens.font.label, fontSize: 17, color: tokens.color.ink }, score: { fontFamily: tokens.font.label, color: tokens.color.brand }, seal: { fontFamily: tokens.font.label, color: tokens.color.pass }, details: { gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: tokens.color.line }, detail: { fontFamily: tokens.font.body, fontSize: 14, color: tokens.color.ink }, detailActions: { flexDirection: 'row', gap: 20, paddingVertical: 6 }, action: { fontFamily: tokens.font.label, color: tokens.color.brand }, simulated: { fontFamily: tokens.font.label, fontSize: 12, color: tokens.color.muted }, warning: { fontFamily: tokens.font.body, fontSize: 12, color: tokens.color.danger } })
