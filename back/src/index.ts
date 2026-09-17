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
export { assertOfficialRestriction, evaluateOfficialRestriction, formatRestrictionReason } from './domain/official-restriction'
export type { OfficialRestriction, RestrictionEvaluation, RestrictionEvaluationStatus, RestrictionEffect, RestrictionSourceStatus, RestrictionLimits, RestrictionTimeWindow } from './domain/official-restriction'
export { SAFE_PLACE_SERVICES, assertSafePlace, filterSafePlaces, hasWomenFriendlySeal, rankSafePlaces, sortSafePlacesByDistance } from './domain/safe-place'
export type { SafePlace, SafePlaceFilter, SafePlaceService, SafePlaceSort } from './domain/safe-place'
export { DEMO_OFFICIAL_RESTRICTIONS, DEMO_SAFE_PLACES } from './domain/safety-fixtures'
export { SAFETY_SOURCE_LABELS, buildRestrictionMark, buildSafePlaceMark, formatSafePlaceServices } from './domain/safety-map'
export type { SafetyMapMark } from './domain/safety-map'
export { listOfficialRestrictions, listSafePlaces } from './services/safety.service'
export { SAFETY_COMMAND_LABELS, pickSafetyGuidance } from './domain/safety-guidance'
export type { SafetyCommand, SafetyGuidanceCandidate } from './domain/safety-guidance'
export { assertTrustedContacts, createEmergencyProtocol, buildEmergencyMessage } from './domain/emergency'
export type { TrustedContact, EmergencyProtocol, EmergencyTransportResult } from './domain/emergency'
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
export {
  FIXTURE_BARRA_VELHA_PATH,
  FIXTURE_COMPATIBLE_ROUTE,
  FIXTURE_BLOCKED_ROUTE,
  FIXTURE_UNAVAILABLE_ROUTE,
  FIXTURE_HERE_OK_BODY,
  FIXTURE_HERE_BLOCKED_BODY,
} from './domain/route-fixtures'
export { parseHereRoute, calculateHereTruckRoute } from './services/here-routing'
export { ROUTE_STATUS_LABEL, formatRouteSummary, filterMapMarksForTruck } from './domain/map-route-ui'
export type { MapMarkLike } from './domain/map-route-ui'
export {
  REPORT_STATUSES,
  isReportStatus,
  ALERT_URGENCIES,
  isAlertUrgency,
  normalizeReportUrgency,
  REPORT_CATEGORIES,
  REPORT_CATEGORY_OPTIONS,
  isReportCategory,
  normalizeReportCategory,
  reportCategoryRequiresNotes,
  formatReportLabel,
  assertReportDraft,
} from './domain/report'
export type {
  Report,
  ReportStatus,
  NewReport,
  ReportLocation,
  AlertUrgency,
  ReportCategory,
} from './domain/report'
export {
  ROUTE_ALERT,
  emptyAlertStats,
  applyConfirmationVote,
  haversineMeters,
  projectOnSegment,
  progressAlongPath,
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
