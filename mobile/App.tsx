// Fallback if a client still requests expo/AppEntry (../../App) instead of expo-router/entry.
// @ts-expect-error expo-router/entry ships without TypeScript declarations
export { default } from 'expo-router/entry'
