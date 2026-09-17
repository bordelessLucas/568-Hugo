import { listSafePlaces, formatSafePlaceServices, hasWomenFriendlySeal, sortSafePlacesByDistance, type SafePlace } from '@rotatrucks/back'
import { useEffect, useState } from 'react'
import { tokens } from '@rotatrucks/back/tokens'
import { StyleSheet, Text, View } from 'react-native'
import { Container } from '@/components/Container'
import { Body, Caption, Heading } from '@/components/Typography'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'

export function SafePlacesScreen() {
  const settings = useSettings()
  const location = useDeviceLocation(settings.shareLocation)
  const [items, setItems] = useState<SafePlace[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { void listSafePlaces().then(setItems).finally(() => setLoading(false)) }, [])
  const places = sortSafePlacesByDistance(items, location.point)
  return <Container edges={['top']}>
    <View style={styles.header}><Heading>Pontos seguros</Heading><Body>Paradas com estrutura cadastrada. Confirme as condições antes de parar.</Body></View>
    {location.status !== 'ready' ? <Caption>Distância indisponível; exibindo a ordem cadastrada.</Caption> : null}
    {loading ? <Caption>Carregando pontos seguros…</Caption> : null}
    {!loading && places.length === 0 ? <Caption>Nenhum ponto seguro cadastrado.</Caption> : null}
    {places.map((place) => <View key={place.id} style={styles.card}>
      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.badge}>{place.origin === 'demo' ? 'Demonstração' : 'Informação verificada'}</Text>
      {hasWomenFriendlySeal(place) ? <Text style={styles.seal}>Ponto Amigo da Caminhoneira</Text> : null}
      <Body>{formatSafePlaceServices(place)}</Body>
      <Caption>Nota {place.ratingAverage.toFixed(1)} · {place.ratingCount} avaliações</Caption>
    </View>)}
  </Container>
}

const styles = StyleSheet.create({ header: { gap: 8, marginVertical: 20 }, card: { gap: 8, backgroundColor: tokens.color.surface, borderColor: tokens.color.line, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 }, title: { fontFamily: tokens.font.label, fontSize: 17, color: tokens.color.ink }, badge: { alignSelf: 'flex-start', fontFamily: tokens.font.label, fontSize: 12, color: tokens.color.muted }, seal: { fontFamily: tokens.font.label, color: tokens.color.pass } })
