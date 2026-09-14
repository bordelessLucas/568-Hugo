import type { GeoPoint } from '@rotatrucks/back'

const BOUNDS = { west: -74, east: -34, north: 6, south: -34 }

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
  { label: 'Rio de Janeiro', point: { latitude: -22.91, longitude: -43.17 } },
  { label: 'São Paulo', point: { latitude: -23.55, longitude: -46.63 } },
  { label: 'Curitiba', point: { latitude: -25.43, longitude: -49.27 } },
  { label: 'Porto Alegre', point: { latitude: -30.03, longitude: -51.23 } },
]

interface MockMapProps {
  userLocation: GeoPoint | null
  destination: GeoPoint | null
  blocked: boolean
}

export function MockMap({ userLocation, destination, blocked }: MockMapProps) {
  const land = LAND.map((point) => place(point).join(',')).join(' ')
  const line =
    userLocation && destination ? `M ${place(userLocation).join(',')} L ${place(destination).join(',')}` : ''

  return (
    <div className="absolute inset-0 bg-[#d5e8f4]" aria-hidden="true">
      <svg viewBox="0 0 1000 1000" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="mock-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b7d4e6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1000" height="1000" fill="url(#mock-grid)" />
        <polygon points={land} fill="#f4faf6" stroke="#0073B8" strokeWidth="3" />
        {CITIES.map((city) => {
          const [x, y] = place(city.point)
          return (
            <g key={city.label}>
              <circle cx={x} cy={y} r="3.5" fill="#4e6a7c" />
              <text x={x + 8} y={y + 4} fill="#4e6a7c" fontSize="13" fontFamily="Nunito, Segoe UI, sans-serif">
                {city.label}
              </text>
            </g>
          )
        })}
        {line ? (
          <path
            d={line}
            fill="none"
            stroke={blocked ? '#c5362b' : '#0073B8'}
            strokeWidth="4"
            strokeDasharray="8 7"
            strokeLinecap="round"
          />
        ) : null}
        {userLocation ? <Pin point={userLocation} fill="#0073B8" /> : null}
        {destination ? <Pin point={destination} fill={blocked ? '#c5362b' : '#073049'} /> : null}
      </svg>
    </div>
  )
}

function Pin({ point, fill }: { point: GeoPoint; fill: string }) {
  const [x, y] = place(point)
  return (
    <g>
      <circle cx={x} cy={y} r="11" fill={fill} />
      <circle cx={x} cy={y} r="4" fill="#ffffff" />
    </g>
  )
}

function place(point: GeoPoint): [number, number] {
  const x = ((point.longitude - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 1000
  const y = ((BOUNDS.north - point.latitude) / (BOUNDS.north - BOUNDS.south)) * 1000
  return [x, y]
}
