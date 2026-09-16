/**
 * Safety net: if Expo is started from the monorepo root (wrong), AppEntry
 * looks for ../../App. Re-export the mobile entry so the redbox is avoided,
 * but ALWAYS prefer: npm run start  (runs inside mobile/).
 */
export { default } from './mobile/App'
