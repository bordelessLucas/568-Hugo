// Fallback if a client still requests expo/AppEntry (../../App) instead of expo-router/entry.
// `expo-router/entry` registers itself through side effects and has no default component.
export { App as default } from 'expo-router/build/qualified-entry'
