import {
  filterSafePlaces,
  formatDistanceLabel,
  formatSafePlaceServices,
  hasWomenFriendlySeal,
  haversineMeters,
  listSafePlaces,
  rankSafePlaces,
  type SafePlace,
  type SafePlaceService,
  type SafePlaceSort,
} from '@rotatrucks/back'
import * as Linking from 'expo-linking'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Container } from '@/components/Container'
import { Icon, type IconName } from '@/components/Icon'
import { Caption } from '@/components/Typography'
import { useSettings } from '@/contexts/SettingsContext'
import { useDeviceLocation } from '@/hooks/useDeviceLocation'
import { pressStyle } from '@/lib/press'

const filters: Array<{ value: SafePlaceService; label: string; icon: IconName }> = [
  { value: 'truck_parking', label: 'Pátio', icon: 'car-sport-outline' },
  { value: 'lighting', label: 'Iluminação', icon: 'bulb-outline' },
  { value: 'security', label: 'Segurança', icon: 'shield-checkmark-outline' },
  { value: 'restroom', label: 'Banheiro', icon: 'water-outline' },
  { value: 'shower', label: 'Chuveiro', icon: 'rainy-outline' },
  { value: 'food', label: 'Comida', icon: 'restaurant-outline' },
  { value: 'repair', label: 'Oficina', icon: 'construct-outline' },
  { value: 'overnight', label: 'Pernoite', icon: 'moon-outline' },
]

const sorts: Array<{ value: SafePlaceSort; label: string }> = [
  { value: 'distance', label: 'Perto' },
  { value: 'rating', label: 'Nota' },
  { value: 'structure', label: 'Estrutura' },
]

export function SafePlacesScreen() {
  const settings = useSettings()
  const location = useDeviceLocation(settings.shareLocation)
  const [items, setItems] = useState<SafePlace[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [services, setServices] = useState<SafePlaceService[]>([])
  const [sort, setSort] = useState<SafePlaceSort>('distance')
  const [selected, setSelected] = useState('')

  useEffect(() => {
    void listSafePlaces()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const places = useMemo(
    () =>
      rankSafePlaces(
        filterSafePlaces(items, {
          query,
          services,
          womenRecommended: settings.womenSafeMode,
        }),
        location.point,
        sort,
      ),
    [items, query, services, settings.womenSafeMode, location.point, sort],
  )

  const selectedPlace = places.find((place) => place.id === selected) ?? null

  return (
    <Container edges={['top']}>
      <View style={styles.stack}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="shield-checkmark" size={26} color={tokens.color.onBrand} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Paradas</Text>
            <Text style={styles.title}>Pontos seguros</Text>
            <Text style={styles.subtitle}>
              Encontre locais com estrutura para parar, descansar e seguir viagem com mais confiança.
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Metric label="Encontrados" value={loading ? '...' : String(places.length)} />
          <Metric label="Filtros" value={String(services.length)} />
          <Metric label="Ordenar" value={sortLabel(sort)} />
        </View>

        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color={tokens.color.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nome ou endereço"
            placeholderTextColor={tokens.color.muted}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              onPress={() => setQuery('')}
              hitSlop={8}
              style={pressStyle(styles.clearButton, { opacity: 0.72 })}
            >
              <Icon name="close-circle" size={20} color={tokens.color.muted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Serviços</Text>
          <View style={styles.chips}>
            {filters.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                icon={filter.icon}
                active={services.includes(filter.value)}
                onPress={() =>
                  setServices((current) =>
                    current.includes(filter.value)
                      ? current.filter((item) => item !== filter.value)
                      : [...current, filter.value],
                  )
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.sortPanel}>
          <Text style={styles.sectionLabel}>Priorizar</Text>
          <View style={styles.segmented}>
            {sorts.map((item) => (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityState={{ selected: sort === item.value }}
                onPress={() => setSort(item.value)}
                style={pressStyle([styles.segment, sort === item.value ? styles.segmentOn : null], {
                  opacity: 0.85,
                })}
              >
                <Text style={[styles.segmentText, sort === item.value ? styles.segmentTextOn : null]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {settings.womenSafeMode ? (
          <Notice
            icon="female-outline"
            text="Modo feminino ativo: exibindo locais recomendados para caminhoneiras. Esta preferência fica somente neste aparelho."
          />
        ) : null}
        {location.status !== 'ready' && sort === 'distance' ? (
          <Notice
            icon="navigate-circle-outline"
            text="Distância indisponível agora. Assim que a localização estiver pronta, a lista volta a priorizar o que está mais perto."
          />
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={tokens.color.brand} />
            <Caption>Carregando pontos seguros...</Caption>
          </View>
        ) : null}

        {!loading && places.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="search-outline" size={24} color={tokens.color.muted} />
            <Text style={styles.emptyTitle}>Nenhuma parada encontrada</Text>
            <Text style={styles.emptyText}>Tente remover filtros ou buscar por outro endereço.</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {places.map((place) => (
            <SafePlaceCard
              key={place.id}
              place={place}
              selected={selectedPlace?.id === place.id}
              distance={distanceLabelFor(location.point, place)}
              onPress={() => setSelected(selected === place.id ? '' : place.id)}
            />
          ))}
        </View>
      </View>
    </Container>
  )
}

function SafePlaceCard({
  place,
  selected,
  distance,
  onPress,
}: {
  place: SafePlace
  selected: boolean
  distance: string | null
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={pressStyle(styles.card, { opacity: 0.94 })}>
      <View style={styles.cardHead}>
        <View style={styles.placeIcon}>
          <Icon name={categoryIcon(place.category)} size={22} color={tokens.color.brand} />
        </View>
        <View style={styles.placeCopy}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeMeta}>
            {distance ? `${distance} • ` : ''}
            {place.ratingCount} avaliações
          </Text>
        </View>
        <View style={styles.ratingPill}>
          <Icon name="star" size={13} color={tokens.color.accent} />
          <Text style={styles.ratingText}>{place.ratingAverage.toFixed(1)}</Text>
        </View>
      </View>

      {hasWomenFriendlySeal(place) ? (
        <View style={styles.sealPill}>
          <Icon name="ribbon-outline" size={15} color={tokens.color.pass} />
          <Text style={styles.sealText}>Ponto Amigo da Caminhoneira</Text>
        </View>
      ) : null}

      <Text style={styles.services}>{formatSafePlaceServices(place)}</Text>
      <Text style={styles.tapHint}>{selected ? 'Ocultar detalhes' : 'Toque para ver detalhes'}</Text>

      {selected ? <PlaceDetails place={place} /> : null}
    </Pressable>
  )
}

function PlaceDetails({ place }: { place: SafePlace }) {
  return (
    <View style={styles.details}>
      {place.address ? <Detail icon="location-outline" label="Endereço" value={place.address} /> : null}
      {place.openingHours ? (
        <Detail icon="time-outline" label="Funcionamento" value={place.openingHours} />
      ) : null}
      <Detail
        icon="checkmark-circle-outline"
        label="Recomendação"
        value="Baseada na estrutura informada e na avaliação da comunidade."
      />
      <View style={styles.detailActions}>
        <ActionLink
          icon="map-outline"
          label="Ver mapa"
          onPress={() => void Linking.openURL(`https://maps.google.com/?q=${place.latitude},${place.longitude}`)}
        />
        <ActionLink
          icon="navigate-outline"
          label="Traçar rota"
          onPress={() =>
            void Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
            )
          }
        />
      </View>
      <Text style={styles.source}>
        {place.origin === 'demo'
          ? 'Dado simulado para teste'
          : `Cadastro verificado em ${place.verifiedAt ?? 'data não informada'}`}
      </Text>
      <Text style={styles.warning}>As condições podem mudar. Confirme o local antes de parar.</Text>
    </View>
  )
}

function Detail({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color={tokens.color.brand} />
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  )
}

function ActionLink({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={pressStyle(styles.actionLink, { opacity: 0.8 })}>
      <Icon name={icon} size={17} color={tokens.color.onBrand} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  )
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string
  icon: IconName
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={pressStyle([styles.chip, active ? styles.chipOn : null], { opacity: 0.85 })}
    >
      <Icon name={icon} size={16} color={active ? tokens.color.onBrand : tokens.color.brand} />
      <Text style={[styles.chipText, active ? styles.chipTextOn : null]}>{label}</Text>
    </Pressable>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function Notice({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.notice}>
      <Icon name={icon} size={19} color={tokens.color.pass} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  )
}

function sortLabel(sort: SafePlaceSort): string {
  if (sort === 'rating') return 'Nota'
  if (sort === 'structure') return 'Estrutura'
  return 'Perto'
}

function categoryIcon(category: SafePlace['category']): IconName {
  if (category === 'gas_station') return 'speedometer-outline'
  if (category === 'restaurant') return 'restaurant-outline'
  if (category === 'service_area') return 'business-outline'
  return 'storefront-outline'
}

function distanceLabelFor(origin: { latitude: number; longitude: number } | null, place: SafePlace): string | null {
  if (!origin) return null
  return formatDistanceLabel(haversineMeters(origin, place))
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingTop: tokens.space[5],
    paddingBottom: tokens.space[8],
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
    padding: tokens.space[5],
    borderRadius: 22,
    backgroundColor: tokens.color.brand,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroCopy: {
    flex: 1,
    gap: tokens.space[1],
  },
  eyebrow: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.sign,
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.label,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: tokens.space[3],
  },
  metric: {
    flex: 1,
    padding: tokens.space[3],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  metricValue: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
  metricLabel: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
  searchBox: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
    paddingHorizontal: tokens.space[4],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.body,
  },
  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: tokens.space[3],
  },
  sectionLabel: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space[2],
  },
  chip: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
    paddingHorizontal: tokens.space[3],
    paddingVertical: tokens.space[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  chipOn: {
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.brand,
  },
  chipText: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  chipTextOn: {
    color: tokens.color.onBrand,
  },
  sortPanel: {
    gap: tokens.space[3],
  },
  segmented: {
    flexDirection: 'row',
    padding: tokens.space[1],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentOn: {
    backgroundColor: tokens.color.fog,
  },
  segmentText: {
    color: tokens.color.muted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  segmentTextOn: {
    color: tokens.color.brand,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
    padding: tokens.space[3],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: '#BFE5CB',
    backgroundColor: '#F0FDF4',
  },
  noticeText: {
    flex: 1,
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    lineHeight: 19,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    padding: tokens.space[4],
  },
  empty: {
    alignItems: 'center',
    gap: tokens.space[2],
    padding: tokens.space[5],
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  emptyTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
  emptyText: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    textAlign: 'center',
  },
  list: {
    gap: tokens.space[3],
  },
  card: {
    gap: tokens.space[3],
    padding: tokens.space[4],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  placeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  placeCopy: {
    flex: 1,
    gap: tokens.space[1],
  },
  placeName: {
    color: tokens.color.ink,
    fontFamily: tokens.font.label,
    fontSize: 17,
    lineHeight: 22,
  },
  placeMeta: {
    color: tokens.color.muted,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: tokens.space[2],
    paddingVertical: tokens.space[1],
    borderRadius: 999,
    backgroundColor: '#FFF7E8',
  },
  ratingText: {
    color: tokens.color.accentInk,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  sealPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[1],
    paddingHorizontal: tokens.space[2],
    paddingVertical: tokens.space[1],
    borderRadius: 999,
    backgroundColor: '#ECFDF3',
  },
  sealText: {
    color: tokens.color.pass,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  services: {
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.label,
    lineHeight: 20,
  },
  tapHint: {
    color: tokens.color.brand,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  details: {
    gap: tokens.space[3],
    paddingTop: tokens.space[3],
    borderTopWidth: 1,
    borderTopColor: tokens.color.line,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    color: tokens.color.muted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  detailValue: {
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.label,
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: 'row',
    gap: tokens.space[3],
    paddingTop: tokens.space[1],
  },
  actionLink: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space[2],
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.color.brand,
  },
  actionText: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  source: {
    color: tokens.color.muted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  warning: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    lineHeight: 18,
  },
})
