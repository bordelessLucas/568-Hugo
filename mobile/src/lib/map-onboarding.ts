const KEY = 'rotatrucks-map-legend-seen'

export async function hasSeenMapLegend(): Promise<boolean> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
    return (await AsyncStorage.getItem(KEY)) === '1'
  } catch {
    return false
  }
}

export async function markMapLegendSeen(): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
  await AsyncStorage.setItem(KEY, '1')
}
