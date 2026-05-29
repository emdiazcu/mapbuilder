import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Polygon, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, Building2, Clock, MapPin } from 'lucide-react'
import { buildingsApi } from '../api/buildings'
import type { Space, Schedule } from '../types'

// Fix Leaflet icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TYPE_LABELS: Record<string, string> = {
  school:     'Escuela',
  commercial: 'Comercial',
  office:     'Oficina',
  dependency: 'Dependencia',
}

const DAY_LABELS: Record<number, string> = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves',  5: 'Viernes', 6: 'Sábado',
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function SpacePopup({ space }: { space: Space }) {
  const active = space.schedules?.filter((s) => s.is_active) ?? []
  return (
    <div className="min-w-[180px]">
      <p className="font-semibold text-gray-900">{space.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">{space.type}</p>
      {active.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {active.map((s: Schedule) => (
            <p key={s.id} className="text-xs text-gray-600">
              {DAY_LABELS[s.day_of_week]}: {formatTime(s.start_time)} – {formatTime(s.end_time)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function spacePositions(space: Space): [number, number][] {
  if (!space.polygon_data || space.polygon_data.length === 0) return []
  return space.polygon_data.map((p) => [p.x, p.y] as [number, number])
}

function FitBounds({ spaces }: { spaces: Space[] }) {
  const map = useMap()
  useEffect(() => {
    const points = spaces.flatMap((s) =>
      (s.polygon_data ?? []).map((p) => [p.x, p.y] as [number, number])
    )
    if (points.length > 0) {
      map.fitBounds(points as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 19 })
    }
  }, [map, spaces])
  return null
}

export default function PublicMapPage() {
  const { token } = useParams<{ token: string }>()

  const { data: building, isLoading, isError } = useQuery({
    queryKey: ['public-map', token],
    queryFn:  () => buildingsApi.showPublic(token!),
    enabled:  !!token,
  })

  // Derive map center from coordinates or first space point
  const center: [number, number] = (() => {
    if (building?.latitude && building?.longitude) {
      return [building.latitude, building.longitude]
    }
    const firstSpace = building?.spaces?.find((s) => s.polygon_data?.length)
    if (firstSpace?.polygon_data?.[0]) {
      return [firstSpace.polygon_data[0].x, firstSpace.polygon_data[0].y]
    }
    return [19.4326, -99.1332]
  })()

  return (
    <div className="flex h-screen flex-col bg-white">

      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4">
        <Link
          to="/maps"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.7} />
        </Link>

        {isLoading ? (
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        ) : building ? (
          <div>
            <p className="text-base font-semibold text-gray-900 leading-5">{building.name}</p>
            <p className="text-xs text-gray-400">
              {TYPE_LABELS[building.type] ?? building.type}
              {building.latitude && building.longitude
                ? ` · ${building.latitude}, ${building.longitude}`
                : ''}
            </p>
          </div>
        ) : null}
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">

        {/* Map */}
        <div className="relative flex-1">
          {isLoading && (
            <div className="flex h-full items-center justify-center bg-gray-50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-gray-50">
              <p className="text-base font-medium text-gray-700">Mapa no encontrado</p>
              <p className="text-sm text-gray-400">El enlace puede ser incorrecto o el edificio fue eliminado.</p>
              <Link to="/maps" className="mt-2 text-sm text-blue-600 hover:underline">
                Volver a Mis Mapas
              </Link>
            </div>
          )}

          {!isLoading && !isError && building && (
            <MapContainer
              center={center}
              zoom={17}
              className="h-full w-full"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={22}
              />

              {building.spaces && <FitBounds spaces={building.spaces} />}

              {building.spaces?.map((space) => {
                const positions = spacePositions(space)
                if (positions.length < 2) return null

                const isClosedShape = positions.length >= 3

                return isClosedShape ? (
                  <Polygon
                    key={space.id}
                    positions={positions}
                    pathOptions={{
                      color:       space.color || '#2563eb',
                      fillColor:   space.color || '#2563eb',
                      fillOpacity: 0.2,
                      weight:      2,
                    }}
                  >
                    <Popup><SpacePopup space={space} /></Popup>
                  </Polygon>
                ) : (
                  <Polyline
                    key={space.id}
                    positions={positions}
                    pathOptions={{ color: space.color || '#2563eb', weight: 3 }}
                  >
                    <Popup><SpacePopup space={space} /></Popup>
                  </Polyline>
                )
              })}
            </MapContainer>
          )}
        </div>

        {/* Sidebar de info */}
        {!isLoading && !isError && building && (
          <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">{building.name}</h2>
              <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {TYPE_LABELS[building.type] ?? building.type}
              </span>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              {building.description && (
                <p className="text-sm text-gray-600">{building.description}</p>
              )}

              {(building.latitude || building.longitude) && (
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.7} />
                  <span>{building.latitude}, {building.longitude}</span>
                </div>
              )}

              {/* Espacios */}
              {building.spaces && building.spaces.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 text-gray-400" strokeWidth={1.7} />
                    {building.spaces.length} espacio{building.spaces.length !== 1 ? 's' : ''}
                  </div>

                  {building.spaces.map((space) => {
                    const active = space.schedules?.filter((s) => s.is_active) ?? []
                    return (
                      <div key={space.id} className="rounded-lg border border-gray-200 p-3">
                        <p className="text-sm font-medium text-gray-900">{space.name}</p>
                        <p className="text-xs text-gray-400">{space.type}</p>
                        {active.length > 0 && (
                          <div className="mt-2 flex flex-col gap-0.5">
                            {active.map((s: Schedule) => (
                              <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="h-3 w-3 shrink-0" strokeWidth={1.7} />
                                <span>{DAY_LABELS[s.day_of_week]}: {formatTime(s.start_time)} – {formatTime(s.end_time)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {(!building.spaces || building.spaces.length === 0) && (
                <p className="text-sm text-gray-400">Este edificio aún no tiene espacios registrados.</p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
