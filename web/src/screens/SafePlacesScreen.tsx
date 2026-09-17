import { DEMO_SAFE_PLACES, formatSafePlaceServices, hasWomenFriendlySeal, sortSafePlacesByDistance } from '@rotatrucks/back'
import { AppFrame } from '../components/AppFrame.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'
import { useDeviceLocation } from '../hooks/useDeviceLocation.ts'

export function SafePlacesScreen() {
  const settings = useSettings()
  const location = useDeviceLocation(settings.shareLocation)
  const places = sortSafePlacesByDistance(DEMO_SAFE_PLACES, location.point)
  return <AppFrame current="safePlaces"><main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-8">
    <div><h1 className="font-sign text-3xl text-ink">Pontos seguros</h1><p className="mt-2 font-body text-sm text-muted">Paradas com estrutura cadastrada. As condições podem mudar; confirme antes de parar.</p></div>
    {location.status !== 'ready' ? <p className="font-body text-sm text-muted">Distância indisponível; exibindo a ordem cadastrada.</p> : null}
    <ul className="flex flex-col gap-3">{places.map((place) => <li key={place.id} className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2"><h2 className="font-body text-lg font-bold text-ink">{place.name}</h2><span className="rounded-full bg-fog px-2.5 py-1 font-body text-xs font-bold text-muted">{place.origin === 'demo' ? 'Demonstração' : 'Informação verificada'}</span></div>
      {hasWomenFriendlySeal(place) ? <p className="mt-2 font-body text-sm font-bold text-pass">Ponto Amigo da Caminhoneira</p> : null}
      <p className="mt-3 font-body text-sm text-ink">{formatSafePlaceServices(place)}</p><p className="mt-2 font-body text-sm text-muted">Nota {place.ratingAverage.toFixed(1)} · {place.ratingCount} avaliações</p>
    </li>)}</ul>
  </div></main></AppFrame>
}
