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
export { REPORT_STATUSES, isReportStatus, ALERT_URGENCIES, isAlertUrgency, normalizeReportUrgency } from './domain/report'
export type { Report, ReportStatus, NewReport, ReportLocation, AlertUrgency } from './domain/report'
export {
  ROUTE_ALERT,
  emptyAlertStats,
  applyConfirmationVote,
  haversineMeters,
  projectOnSegment,
  pickRouteAlert,
  formatDistanceLabel,
  ALERT_URGENCY_LABEL,
  ALERT_STATUS_LABEL,
} from './domain/route-alert'
export type {
  AlertAnswer,
  AlertPhase,
  AlertPriority,
  RouteAlertSource,
  AlertStats,
  EvaluatedRouteAlert,
  TripAlertContext,
} from './domain/route-alert'
export {
  PILOT_COMMUNITY,
  PILOT_MARKS,
  COMMUNITY_NEAR_RADIUS,
  COMMUNITY_STATUS_LABEL,
  assertCommunityDraft,
  filterReportsNearCommunity,
  buildCommunityFeed,
} from './domain/community'
export type {
  Community,
  CommunityStatus,
  NewCommunity,
  PilotMark,
  CommunityFeedItem,
} from './domain/community'
export {
  createCommunity,
  listApprovedCommunities,
  listCommunitiesByCreator,
  listVisibleCommunities,
  listPilotCommunities,
  listPilotMarks,
  getCommunity,
  updatePendingCommunity,
  deletePendingCommunity,
  loadCommunityDetail,
} from './services/community.service'
export {
  alertIdForReport,
  alertIdForPilot,
  listRouteAlertSources,
  getAlertStats,
  listAlertStats,
  loadRouteAlertForTrip,
  submitAlertConfirmation,
  evaluateLocalRouteAlert,
} from './services/route-alert.service'
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
  updateTruck,
  listTrucksByUser,
  getUserTruck,
  createReport,
  listReportsByTruckType,
  listRecentReports,
} from './services/database.service'
