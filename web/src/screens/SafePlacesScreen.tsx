import { filterSafePlaces, formatSafePlaceServices, hasWomenFriendlySeal, listSafePlaces, rankSafePlaces, type SafePlace, type SafePlaceService, type SafePlaceSort } from '@rotatrucks/back'
import { useEffect, useMemo, useState } from 'react'
import { AppFrame } from '../components/AppFrame.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'
import { useDeviceLocation } from '../hooks/useDeviceLocation.ts'

const serviceOptions: Array<{ value: SafePlaceService; label: string }> = [{ value: 'truck_parking', label: 'Estacionamento' }, { value: 'lighting', label: 'Iluminação' }, { value: 'security', label: 'Segurança' }, { value: 'restroom', label: 'Banheiro' }, { value: 'shower', label: 'Chuveiro' }, { value: 'food', label: 'Comida' }, { value: 'repair', label: 'Oficina' }, { value: 'overnight', label: 'Pernoite' }]

export function SafePlacesScreen() {
  const settings = useSettings(), location = useDeviceLocation(settings.shareLocation)
  const [items, setItems] = useState<SafePlace[]>([]), [loading, setLoading] = useState(true), [query, setQuery] = useState(''), [services, setServices] = useState<SafePlaceService[]>([]), [sort, setSort] = useState<SafePlaceSort>('distance'), [selected, setSelected] = useState('')
  useEffect(() => { void listSafePlaces().then(setItems).finally(() => setLoading(false)) }, [])
  const places = useMemo(() => rankSafePlaces(filterSafePlaces(items, { query, services, womenRecommended: settings.womenSafeMode }), location.point, sort), [items, query, services, settings.womenSafeMode, location.point, sort])
  return <AppFrame current="safePlaces"><main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-8">
    <div><h1 className="font-sign text-3xl text-ink">Pontos seguros</h1><p className="mt-2 font-body text-sm text-muted">Busque estrutura e confira os detalhes antes de parar.</p></div>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou endereço" className="rounded-xl border border-line bg-surface px-4 py-3 font-body text-sm text-ink" />
    <div className="flex flex-wrap gap-2">{serviceOptions.map((option) => <button key={option.value} type="button" onClick={() => setServices((current) => current.includes(option.value) ? current.filter((item) => item !== option.value) : [...current, option.value])} className={`rounded-full border px-3 py-2 font-body text-xs font-bold ${services.includes(option.value) ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink'}`}>{option.label}</button>)}</div>
    <select value={sort} onChange={(event) => setSort(event.target.value as SafePlaceSort)} className="rounded-xl border border-line bg-surface px-4 py-3 font-body text-sm text-ink"><option value="distance">Mais perto</option><option value="rating">Melhor nota</option><option value="structure">Mais estrutura</option></select>
    {settings.womenSafeMode ? <p className="rounded-xl bg-green-50 p-3 font-body text-sm text-ink">Modo feminino ativo: mostrando pontos recomendados para caminhoneiras.</p> : null}
    {loading ? <p className="font-body text-sm text-muted">Carregando pontos seguros…</p> : null}
    {!loading && places.length === 0 ? <p className="font-body text-sm text-muted">Nenhum ponto corresponde aos filtros.</p> : null}
    <ul className="flex flex-col gap-3">{places.map((place) => <li key={place.id}><button type="button" onClick={() => setSelected(selected === place.id ? '' : place.id)} className="w-full rounded-2xl border border-line bg-surface p-5 text-left">
      <div className="flex items-start justify-between gap-3"><h2 className="font-body text-lg font-bold text-ink">{place.name}</h2><span className="font-body text-sm font-bold text-brand">{place.ratingAverage.toFixed(1)} ★</span></div>
      {hasWomenFriendlySeal(place) ? <p className="mt-2 font-body text-sm font-bold text-pass">Ponto Amigo da Caminhoneira</p> : null}<p className="mt-3 font-body text-sm text-ink">{formatSafePlaceServices(place)}</p>
      {selected === place.id ? <div className="mt-4 border-t border-line pt-4 font-body text-sm text-ink">{place.address ? <p>Endereço: {place.address}</p> : null}{place.openingHours ? <p>Funcionamento: {place.openingHours}</p> : null}<p className="mt-2 text-muted">{place.origin === 'demo' ? 'Dado simulado para teste' : `Verificado em ${place.verifiedAt ?? 'data não informada'}`}</p><p className="mt-2 text-danger">Confirme as condições antes de parar.</p></div> : null}
    </button></li>)}</ul>
  </div></main></AppFrame>
}
