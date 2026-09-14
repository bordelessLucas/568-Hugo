export { tokens } from './design/tokens'
export type { Tokens } from './design/tokens'
export type { UserProfile, RegisterUserInput, SignInInput, Gender } from './domain/user'
export { GENDERS, GENDER_LABELS, isGender } from './domain/user'
export {
  TRUCK_TYPES,
  TRUCK_AXLE_PROFILE,
  isTruckType,
} from './domain/truck'
export type { Truck, TruckType, TruckDimensions, NewTruck } from './domain/truck'
export {
  TRUCK_TYPE_OPTIONS,
  NATIONAL_DIMENSION_LIMITS,
  dimensionWarnings,
  assertTruckDraft,
} from './domain/truck'
export {
  ROUTE_UNAVAILABLE_MESSAGE,
  ROUTE_BLOCKED_MESSAGE,
  toHereVehicle,
  buildHereRouteSearchParams,
} from './domain/route'
export type {
  GeoPoint,
  RouteQuery,
  RouteResult,
  CompatibleRoute,
  BlockedRoute,
  UnavailableRoute,
  HereVehicleParams,
} from './domain/route'
export { REPORT_STATUSES, isReportStatus } from './domain/report'
export type { Report, ReportStatus, NewReport, ReportLocation } from './domain/report'
export {
  initFirebase,
  getFirebaseAuth,
  getFirestoreDb,
  getFirebaseStorage,
} from './services/firebase'
export type { FirebaseClientConfig } from './services/firebase'
export {
  signIn,
  registerUser,
  signOutUser,
  sendPasswordReset,
  observeAuthSession,
} from './services/auth.service'
export type { AuthSession } from './services/auth.service'
export { saveUserProfile, getUserProfile, updateUserSetup } from './services/user.service'
export type { UserSetupUpdate } from './services/user.service'
export {
  createTruck,
  listTrucksByUser,
  getUserTruck,
  createReport,
  listReportsByTruckType,
} from './services/database.service'
