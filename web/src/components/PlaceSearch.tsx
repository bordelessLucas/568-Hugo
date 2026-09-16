import { useEffect, useId, useRef, useState } from 'react'
import type { GeoPoint } from '@rotatrucks/back'
import { distanceMeters, formatDistance } from '../lib/measures.ts'
import { searchPlaces, type PlaceHit } from '../lib/places.ts'

interface PlaceSearchProps {
  near: GeoPoint | null
  tags?: string[]
  onSelect: (place: PlaceHit) => void
  onClear?: () => void
}

export function PlaceSearch({ near, tags = [], onSelect, onClear }: PlaceSearchProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlaceHit[]>([])
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle')
  const [chosen, setChosen] = useState<PlaceHit | null>(null)

  useEffect(() => {
    const text = query.trim()
    if (text.length < 3) {
      setHits([])
      setStatus('idle')
      return
    }

    let active = true
    const timer = window.setTimeout(() => {
      setStatus('loading')
      void searchPlaces(text, near)
        .then((next) => {
          if (!active) return
          setHits(next)
          setStatus(next.length === 0 ? 'empty' : 'idle')
          setOpen(true)
        })
        .catch(() => {
          if (!active) return
          setHits([])
          setStatus('error')
          setOpen(true)
        })
    }, 280)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [near, query])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const choose = (place: PlaceHit) => {
    setQuery(place.label)
    setChosen(place)
    setOpen(false)
    onSelect(place)
  }

  const target = chosen && chosen.label === query ? chosen : (hits[0] ?? null)
  const distanceLabel = distanceLabelFor(near, target)

  return (
    <div ref={rootRef} className="pointer-events-auto w-full max-w-3xl">
      <form
        className="place-search flex h-14 items-center gap-3 rounded-full border border-white/70 bg-[#f4f1ec]/95 px-4 shadow-[0_10px_30px_rgba(7,48,73,0.16)] backdrop-blur-md"
        onSubmit={(event) => {
          event.preventDefault()
          const first = hits[0]
          if (first) choose(first)
          else setOpen(query.trim().length >= 3)
        }}
      >
        <label htmlFor={listId + '-input'} className="sr-only">
          Buscar localização
        </label>
        <input
          id={listId + '-input'}
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Para onde?"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (query.trim().length >= 3) setOpen(true)
          }}
          className="h-full min-w-0 flex-1 bg-transparent font-body text-base text-ink outline-none placeholder:text-muted"
        />
        {distanceLabel ? (
          <span className="shrink-0 font-body text-[13px] font-bold text-ink">{distanceLabel}</span>
        ) : query.trim().length >= 3 && !near ? (
          <span className="hidden shrink-0 font-body text-[13px] text-muted sm:inline">Sem localização</span>
        ) : null}
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setChosen(null)
              setHits([])
              setOpen(false)
              setStatus('idle')
              onClear?.()
            }}
            className="font-body text-[13px] font-bold text-muted"
          >
            Limpar
          </button>
        ) : null}
        <button
          type="submit"
          className="h-10 shrink-0 rounded-full bg-ink px-5 font-body text-sm font-bold text-on-brand"
        >
          Buscar
        </button>
      </form>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="mt-2 overflow-hidden rounded-3xl border border-white/70 bg-surface/95 shadow-[0_10px_30px_rgba(7,48,73,0.16)] backdrop-blur-md"
        >
          {status === 'loading' ? <StatusRow text="Buscando…" /> : null}
          {status === 'empty' ? <StatusRow text="Nenhum lugar encontrado." /> : null}
          {status === 'error' ? <StatusRow text="Não foi possível buscar agora." /> : null}
          {hits.map((place) => (
            <li key={place.id} role="option">
              <button
                type="button"
                onClick={() => choose(place)}
                className="flex w-full flex-col items-start gap-1 px-5 py-3 text-left hover:bg-fog"
              >
                <span className="font-body text-sm font-bold text-ink">{place.label}</span>
                {place.detail ? (
                  <span className="font-body text-[13px] text-muted">{place.detail}</span>
                ) : null}
                <span className="font-body text-[13px] font-bold text-ink">
                  {distanceLabelFor(near, place) ?? 'Sem localização'}
                </span>
                {tags.length > 0 ? <TagRow tags={tags} /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {!open && chosen && chosen.label === query ? (
        <div className="mt-2 rounded-3xl border border-white/70 bg-surface/95 px-5 py-3 shadow-[0_10px_30px_rgba(7,48,73,0.16)] backdrop-blur-md">
          <p className="font-body text-sm font-bold text-ink">{chosen.label}</p>
          {chosen.detail ? <p className="mt-0.5 font-body text-[13px] text-muted">{chosen.detail}</p> : null}
          <p className="mt-1 font-body text-[13px] font-bold text-ink">
            {distanceLabelFor(near, chosen) ?? 'Sem localização'}
          </p>
          {tags.length > 0 ? (
            <div className="mt-2">
              <TagRow tags={tags} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[#c5362b]/10 px-2 py-0.5 font-body text-[12px] font-bold text-danger"
        >
          {tag}
        </span>
      ))}
    </span>
  )
}

function distanceLabelFor(near: GeoPoint | null, place: PlaceHit | null): string | null {
  if (!near || !place) return null
  return formatDistance(distanceMeters(near, place.point))
}

function StatusRow({ text }: { text: string }) {
  return <li className="px-5 py-3 font-body text-sm text-muted">{text}</li>
}
