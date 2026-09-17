export type SafetyCommand = 'STOP' | 'SLOW_DOWN' | 'RISK_AHEAD' | 'SAFE_STOP'
export interface SafetyGuidanceCandidate { id: string; command: SafetyCommand; distanceMeters: number; title: string; reason: string; details?: string[] }
export const SAFETY_COMMAND_LABELS: Record<SafetyCommand, string> = { STOP: 'NÃO PASSA - DESVIE', SLOW_DOWN: 'ATENÇÃO - REDUZA', RISK_AHEAD: 'RISCO À FRENTE', SAFE_STOP: 'PARADA SEGURA PRÓXIMA' }
const priority: Record<SafetyCommand, number> = { STOP: 0, RISK_AHEAD: 1, SLOW_DOWN: 2, SAFE_STOP: 3 }
export function pickSafetyGuidance(items: SafetyGuidanceCandidate[]): SafetyGuidanceCandidate | null {
  return [...items].filter((item) => Number.isFinite(item.distanceMeters) && item.distanceMeters >= 0).sort((a, b) => priority[a.command] - priority[b.command] || a.distanceMeters - b.distanceMeters)[0] ?? null
}
