import type { GeoPoint, SafetyMapMark } from '@rotatrucks/back'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Defs, Line, Path, Pattern, Polygon, Text as SvgText } from 'react-native-svg'
import { tokens } from '@rotatrucks/back/tokens'

const BOUNDS = { west: -74, east: -34, north: 6, south: -34 }
const VIEW = 1000

const LAND: GeoPoint[] = [
  { longitude: -51.1, latitude: 4.4 },
  { longitude: -60.0, latitude: 2.2 },
  { longitude: -67.8, latitude: 1.2 },
  { longitude: -70.0, latitude: -4.2 },
  { longitude: -73.4, latitude: -9.2 },
  { longitude: -69.6, latitude: -13.1 },
  { longitude: -62.2, latitude: -16.4 },
  { longitude: -57.6, latitude: -22.2 },
  { longitude: -53.4, latitude: -33.7 },
  { longitude: -48.5, latitude: -28.2 },
  { longitude: -44.6, latitude: -23.1 },
  { longitude: -40.9, latitude: -20.5 },
  { longitude: -37.2, latitude: -11.8 },
  { longitude: -34.8, latitude: -6.4 },
  { longitude: -38.4, latitude: -3.2 },
  { longitude: -44.2, latitude: -2.2 },
  { longitude: -49.8, latitude: 1.4 },
  { longitude: -51.1, latitude: 4.4 },
]

const CITIES: { label: string; point: GeoPoint }[] = [
  { label: 'Manaus', point: { latitude: -3.1, longitude: -60.0 } },
  { label: 'Fortaleza', point: { latitude: -3.7, longitude: -38.5 } },
  { label: 'Recife', point: { latitude: -8.05, longitude: -34.9 } },
  { label: 'Salvador', point: { latitude: -12.97, longitude: -38.5 } },
  { label: 'Brasília', point: { latitude: -15.78, longitude: -47.93 } },
  { label: 'Belo Horizonte', point: { latitude: -19.92, longitude: -43.94 } },
  { label: 'Rio', point: { latitude: -22.91, longitude: -43.17 } },
  { label: 'São Paulo', point: { latitude: -23.55, longitude: -46.63 } },
  { label: 'Curitiba', point: { latitude: -25.43, longitude: -49.27 } },
  { label: 'Porto Alegre', point: { latitude: -30.03, longitude: -51.23 } },
]

export interface MapMark {
  id: string
  latitude: number
  longitude: number
  status: 'passa' | 'nao_passa'
  label?: string
}

interface MockMapProps {
  userLocation: GeoPoint | null
  destination: GeoPoint | null
  blocked: boolean
  marks?: MapMark[]
  safetyMarks?: SafetyMapMark[]
  onSafetyMarkPress?: (mark: SafetyMapMark) => void
  /** Polyline da rota (HERE / fixture). Sem path, desenha reta eu→destino. */
  path?: GeoPoint[]
  /** Destaca a marcação do aviso ativo na Home. */
  highlightId?: string | null
}

export function MockMap({
  userLocation,
  destination,
  blocked,
  marks = [],
  safetyMarks = [],
  onSafetyMarkPress,
  path = [],
  highlightId = null,
}: MockMapProps) {
  const viewBox = useMemo(
    () => fitViewBox(userLocation, destination, [...marks, ...safetyMarks], path),
    [destination, marks, path, safetyMarks, userLocation],
  )
  const land = LAND.map((point) => place(point).join(',')).join(' ')
  const routePath =
    path.length >= 2
      ? pathToSvg(path)
      : userLocation && destination
        ? `M ${place(userLocation).join(' ')} L ${place(destination).join(' ')}`
        : ''

  return (
    <View style={styles.wrap} accessibilityLabel="Mapa de apoio RotaTrucks">
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <Pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <Path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b7d4e6" strokeWidth="1" />
          </Pattern>
        </Defs>
        <Path d={`M0 0 H ${VIEW * 2} V ${VIEW * 2} H 0 Z`} fill="#cfe4f2" />
        <Path d={`M0 0 H ${VIEW * 2} V ${VIEW * 2} H 0 Z`} fill="url(#grid)" opacity={0.9} />
        <Polygon points={land} fill="#eef7f1" stroke={tokens.color.brand} strokeWidth="3.5" />

        <Circle
          cx={place({ latitude: -26.632, longitude: -48.6849 })[0]}
          cy={place({ latitude: -26.632, longitude: -48.6849 })[1]}
          r="55"
          fill="rgba(0,115,184,0.08)"
        />

        {CITIES.map((city) => {
          const [x, y] = place(city.point)
          return (
            <SvgText
              key={city.label}
              x={x + 8}
              y={y + 4}
              fill={tokens.color.muted}
              fontSize="14"
              fontFamily="Nunito"
            >
              {city.label}
            </SvgText>
          )
        })}
        {CITIES.map((city) => {
          const [x, y] = place(city.point)
          return <Circle key={`${city.label}-dot`} cx={x} cy={y} r="3.5" fill={tokens.color.muted} />
        })}

        {marks.map((mark) => {
          const [x, y] = place({ latitude: mark.latitude, longitude: mark.longitude })
          const fill = mark.status === 'passa' ? tokens.color.pass : tokens.color.danger
          const active = highlightId != null && highlightId === mark.id
          return (
            <Circle
              key={mark.id}
              cx={x}
              cy={y}
              r={active ? 12 : 7}
              fill={fill}
              stroke={active ? tokens.color.accent : '#fff'}
              strokeWidth={active ? 4 : 2}
              opacity={0.92}
            />
          )
        })}
        {safetyMarks.map((mark) => {
          const [x, y] = place(mark)
          const fill = mark.tone === 'danger' ? '#C5362B' : mark.tone === 'warning' ? '#D98600' : mark.tone === 'safe' ? '#1B7A45' : '#64748B'
          return <Circle key={mark.id} cx={x} cy={y} r="9" fill={fill} stroke="#fff" strokeWidth="3" onPress={() => onSafetyMarkPress?.(mark)} />
        })}

        {routePath ? (
          <>
            <Path
              d={routePath}
              fill="none"
              stroke={blocked ? tokens.color.danger : tokens.color.brand}
              strokeWidth="10"
              strokeOpacity={0.18}
              strokeLinecap="round"
            />
            <Path
              d={routePath}
              fill="none"
              stroke={blocked ? tokens.color.danger : tokens.color.brand}
              strokeWidth="4"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
          </>
        ) : null}

        {userLocation ? <MapPin point={userLocation} fill={tokens.color.brand} /> : null}
        {destination ? (
          <MapPin point={destination} fill={blocked ? tokens.color.danger : tokens.color.ink} />
        ) : null}
      </Svg>
    </View>
  )
}

function MapPin({ point, fill }: { point: GeoPoint; fill: string }) {
  const [x, y] = place(point)
  return (
    <>
      <Circle cx={x} cy={y} r="14" fill={fill} opacity={0.2} />
      <Circle cx={x} cy={y} r="11" fill={fill} stroke="#fff" strokeWidth="3" />
      <Circle cx={x} cy={y} r="4" fill="#fff" />
      <Line x1={x} y1={y + 11} x2={x} y2={y + 22} stroke={fill} strokeWidth="3" strokeLinecap="round" />
    </>
  )
}

function place(point: GeoPoint): [number, number] {
  const x = ((point.longitude - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * VIEW
  const y = ((BOUNDS.north - point.latitude) / (BOUNDS.north - BOUNDS.south)) * VIEW
  return [x, y]
}

function pathToSvg(path: GeoPoint[]): string {
  return path
    .map((point, index) => {
      const [x, y] = place(point)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function fitViewBox(
  user: GeoPoint | null,
  destination: GeoPoint | null,
  marks: Array<Pick<GeoPoint, 'latitude' | 'longitude'>>,
  path: GeoPoint[] = [],
): string {
  const focus: GeoPoint[] = []
  if (user) focus.push(user)
  if (destination) focus.push(destination)
  path.forEach((point) => focus.push(point))
  if (focus.length === 0 && marks.length > 0) {
    marks.slice(0, 6).forEach((mark) =>
      focus.push({ latitude: mark.latitude, longitude: mark.longitude }),
    )
  }
  if (focus.length === 0) return `0 0 ${VIEW} ${VIEW}`

  const pts = focus.map(place)
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const pad = focus.length === 1 ? 120 : 90
  const width = Math.max(220, maxX - minX + pad * 2)
  const height = Math.max(220, maxY - minY + pad * 2)
  const size = Math.max(width, height)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return `${cx - size / 2} ${cy - size / 2} ${size} ${size}`
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#cfe4f2',
    overflow: 'hidden',
  },
})
