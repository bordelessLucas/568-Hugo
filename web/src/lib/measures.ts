export function parseMeasure(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '' || Number.isNaN(Number(normalized))) {
    return null
  }
  const value = Number(normalized)
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }
  return value
}

export function formatMeters(value: number): string {
  return (
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m'
  )
}

export function distanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const earth = 6_371_000
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  const lat1 = toRad(from.latitude)
  const lat2 = toRad(to.latitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return (meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' km'
  }
  return Math.round(meters).toLocaleString('pt-BR') + ' m'
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours <= 0) return minutes + ' min'
  return hours + ' h ' + minutes + ' min'
}

export function formatWeight(totalWeightKg: number): string {
  const tons = totalWeightKg / 1000
  return tons.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' t'
}
