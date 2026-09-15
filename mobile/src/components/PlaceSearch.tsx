import { useEffect, useState } from 'react'
import type { GeoPoint } from '@rotatrucks/back'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon } from '@/components/Icon'
import { distanceMeters, formatDistance } from '@/lib/measures'
import { searchPlaces, type PlaceHit } from '@/lib/places'

interface PlaceSearchProps {
  near: GeoPoint | null
  tags?: string[]
  onSelect: (place: PlaceHit) => void
  /** Limpa o destino no mapa (obrigatório para o motorista não ficar preso na rota). */
  onClear?: () => void
}

export function PlaceSearch({ near, tags = [], onSelect, onClear }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlaceHit[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle')
  const [chosen, setChosen] = useState<PlaceHit | null>(null)

  useEffect(() => {
    const text = query.trim()
    if (text.length < 3) {
      setHits([])
      setStatus('idle')
      return
    }
    let active = true
    const timer = setTimeout(() => {
      setStatus('loading')
      void searchPlaces(text, near)
        .then((next) => {
          if (!active) return
          setHits(next)
          setStatus(next.length === 0 ? 'empty' : 'idle')
        })
        .catch(() => {
          if (!active) return
          setHits([])
          setStatus('error')
        })
    }, 280)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [near, query])

  const choose = (place: PlaceHit) => {
    setQuery(place.label)
    setChosen(place)
    setHits([])
    onSelect(place)
  }

  const target = chosen && chosen.label === query ? chosen : (hits[0] ?? null)
  const distanceLabel = distanceLabelFor(near, target)

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Icon name="search-outline" size={20} color={tokens.color.muted} />
        <TextInput
          value={query}
          onChangeText={(value) => {
            setQuery(value)
            if (chosen && value !== chosen.label) setChosen(null)
          }}
          placeholder="Para onde?"
          placeholderTextColor={tokens.color.muted}
          style={styles.input}
          autoCorrect={false}
        />
        {distanceLabel ? <Text style={styles.distance}>{distanceLabel}</Text> : null}
        {query ? (
          <Pressable
            onPress={() => {
              setQuery('')
              setChosen(null)
              setHits([])
              setStatus('idle')
              onClear?.()
            }}
            accessibilityRole="button"
            accessibilityLabel="Limpar destino"
          >
            <Icon name="close-circle" size={20} color={tokens.color.muted} />
          </Pressable>
        ) : null}
      </View>

      {status === 'loading' ? (
        <View style={styles.panel}>
          <ActivityIndicator color={tokens.color.brand} />
        </View>
      ) : null}
      {status === 'empty' ? (
        <View style={styles.panel}>
          <Text style={styles.muted}>Nenhum lugar encontrado.</Text>
        </View>
      ) : null}
      {status === 'error' ? (
        <View style={styles.panel}>
          <Text style={styles.muted}>Não foi possível buscar agora.</Text>
        </View>
      ) : null}
      {hits.length > 0 ? (
        <View style={styles.panel}>
          {hits.map((place) => (
            <Pressable key={place.id} onPress={() => choose(place)} style={styles.hit}>
              <View style={styles.hitIcon}>
                <Icon name="location-outline" size={18} color={tokens.color.brand} />
              </View>
              <View style={styles.hitCopy}>
                <Text style={styles.hitLabel}>{place.label}</Text>
                {place.detail ? <Text style={styles.muted}>{place.detail}</Text> : null}
                <Text style={styles.distance}>{distanceLabelFor(near, place) ?? 'Sem localização'}</Text>
                {tags.length > 0 ? <TagRow tags={tags} /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
      {chosen && chosen.label === query && hits.length === 0 ? (
        <View style={styles.panel}>
          <View style={styles.hit}>
            <View style={styles.hitIcon}>
              <Icon name="flag-outline" size={18} color={tokens.color.brand} />
            </View>
            <View style={styles.hitCopy}>
              <Text style={styles.hitLabel}>{chosen.label}</Text>
              {chosen.detail ? <Text style={styles.muted}>{chosen.detail}</Text> : null}
              <Text style={styles.distance}>{distanceLabelFor(near, chosen) ?? 'Sem localização'}</Text>
              {tags.length > 0 ? <TagRow tags={tags} /> : null}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <View style={styles.tags}>
      {tags.map((tag) => (
        <Text key={tag} style={styles.tag}>
          {tag}
        </Text>
      ))}
    </View>
  )
}

function distanceLabelFor(near: GeoPoint | null, place: PlaceHit | null): string | null {
  if (!near || !place) return null
  return formatDistance(distanceMeters(near, place.point))
}

const styles = StyleSheet.create({
  wrap: {
    gap: tokens.space[2],
  },
  bar: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: tokens.color.line,
    paddingHorizontal: tokens.space[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[2],
    shadowColor: '#073049',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  input: {
    flex: 1,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.body,
    color: tokens.color.ink,
    paddingVertical: tokens.space[3],
  },
  distance: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.ink,
  },
  panel: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: tokens.color.line,
    padding: tokens.space[3],
    gap: tokens.space[2],
  },
  hit: {
    flexDirection: 'row',
    gap: tokens.space[3],
    paddingVertical: tokens.space[2],
  },
  hitIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  hitCopy: {
    flex: 1,
    gap: 2,
  },
  hitLabel: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  muted: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(197,54,43,0.1)',
    color: tokens.color.danger,
    fontFamily: tokens.font.label,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
})
