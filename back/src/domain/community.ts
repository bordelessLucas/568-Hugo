import type { TruckType } from './truck'
import type { ReportStatus } from './report'

export type CommunityStatus = 'pending' | 'approved' | 'rejected'

export interface Community {
  id: string
  name: string
  description: string
  city: string
  state: string
  creatorId: string
  status: CommunityStatus
  createdAt: string
  latitude: number
  longitude: number
  system?: boolean
}

export type NewCommunity = Omit<Community, 'id' | 'createdAt' | 'status' | 'system'>

export interface PilotMark {
  id: string
  communityId: string
  label: string
  status: ReportStatus
  truckType: TruckType
  notes: string
  latitude: number
  longitude: number
  source: string
  /** Sem destino só dispara se extreme. */
  urgency?: 'normal' | 'extreme'
}

/** Endereço do titular não aparece nos PDFs. Piloto explícito: Barra Velha / SC. */
export const PILOT_COMMUNITY: Community = {
  id: 'pilot-barra-velha',
  name: 'Barra Velha / SC',
  description:
    'Comunidade piloto do RotaTrucks. Viaduto da BR-101 e restrições da SC-401 para validar passa e não passa.',
  city: 'Barra Velha',
  state: 'SC',
  creatorId: 'system',
  status: 'approved',
  createdAt: '2025-01-01T00:00:00.000Z',
  latitude: -26.632,
  longitude: -48.6849,
  system: true,
}

export const PILOT_MARKS: PilotMark[] = [
  {
    id: 'pilot-br101-viaduto',
    communityId: PILOT_COMMUNITY.id,
    label: 'Viaduto BR-101',
    status: 'nao_passa',
    truckType: 'bitrem',
    notes: 'Altura crítica citada de 4,5 m. Conferir com o caminhão antes de entrar.',
    latitude: -26.6355,
    longitude: -48.6902,
    source: 'DNIT / mídia local — piloto Barra Velha',
    urgency: 'normal',
  },
  {
    id: 'pilot-br101-acidente',
    communityId: PILOT_COMMUNITY.id,
    label: 'Acidente grave na BR-101',
    status: 'nao_passa',
    truckType: 'truck',
    notes: 'Urgência extrema de exemplo do piloto. Aparece mesmo sem destino se você estiver perto.',
    latitude: -26.6332,
    longitude: -48.687,
    source: 'Seed RotaTrucks — urgência extrema',
    urgency: 'extreme',
  },
  {
    id: 'pilot-sc401-pico',
    communityId: PILOT_COMMUNITY.id,
    label: 'Acesso BR-101 / região Barra Velha (pico)',
    status: 'nao_passa',
    truckType: 'truck',
    notes:
      'Referência do piloto: em SC, caminhões acima de 23 t têm restrição de horário em vias de pico (ex.: SC-401). Confira o horário antes de seguir.',
    latitude: -26.6408,
    longitude: -48.7015,
    source: 'Governo de SC — restrição estadual, pin no corredor de Barra Velha',
  },
  {
    id: 'pilot-barra-centro',
    communityId: PILOT_COMMUNITY.id,
    label: 'Centro Barra Velha',
    status: 'passa',
    truckType: 'toco',
    notes: 'Ponto de referência do piloto. Toco em circulação urbana.',
    latitude: -26.632,
    longitude: -48.6849,
    source: 'Seed RotaTrucks',
  },
]

export function assertCommunityDraft(input: NewCommunity): void {
  if (input.name.trim().length < 3) {
    throw new Error('Informe um nome com pelo menos 3 caracteres.')
  }
  if (input.description.trim().length < 8) {
    throw new Error('Descreva a comunidade com pelo menos 8 caracteres.')
  }
  if (input.city.trim() === '' || input.state.trim() === '') {
    throw new Error('Informe cidade e estado.')
  }
  if (input.state.trim().length !== 2) {
    throw new Error('Use a UF com 2 letras, como SC.')
  }
  if (input.creatorId.trim() === '') {
    throw new Error('Comunidade sem autor.')
  }
  if (
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    throw new Error('Localização da comunidade inválida.')
  }
}

export interface CommunityFeedItem {
  id: string
  kind: 'pilot' | 'report'
  label: string
  status: ReportStatus
  notes: string
  truckType: TruckType
  latitude: number
  longitude: number
  source?: string
  createdAt?: string
}

/** Raio aproximado em graus (~15 km na latitude de SC). */
export const COMMUNITY_NEAR_RADIUS = 0.15

export function filterReportsNearCommunity(
  reports: Array<{
    id: string
    status: ReportStatus
    notes: string
    truckType: TruckType
    latitude: number
    longitude: number
    createdAt: string
  }>,
  community: Pick<Community, 'latitude' | 'longitude'>,
  radius = COMMUNITY_NEAR_RADIUS,
) {
  return reports.filter((report) => {
    const dLat = report.latitude - community.latitude
    const dLng = report.longitude - community.longitude
    return dLat * dLat + dLng * dLng < radius * radius
  })
}

export function buildCommunityFeed(
  community: Community,
  reports: Array<{
    id: string
    status: ReportStatus
    notes: string
    truckType: TruckType
    latitude: number
    longitude: number
    createdAt: string
  }>,
): CommunityFeedItem[] {
  const marks = PILOT_MARKS.filter((item) => item.communityId === community.id).map((mark) => ({
    id: mark.id,
    kind: 'pilot' as const,
    label: mark.label,
    status: mark.status,
    notes: mark.notes,
    truckType: mark.truckType,
    latitude: mark.latitude,
    longitude: mark.longitude,
    source: mark.source,
  }))
  const nearby = filterReportsNearCommunity(reports, community).map((report) => ({
    id: report.id,
    kind: 'report' as const,
    label: report.status === 'passa' ? 'Ocorrência: passa' : 'Ocorrência: não passa',
    status: report.status,
    notes: report.notes || 'Sem observação.',
    truckType: report.truckType,
    latitude: report.latitude,
    longitude: report.longitude,
    createdAt: report.createdAt,
  }))
  return [...marks, ...nearby]
}

export const COMMUNITY_STATUS_LABEL: Record<CommunityStatus, string> = {
  pending: 'Aguardando um administrador',
  approved: 'Aberta para todos',
  rejected: 'Pedido recusado',
}

