import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import L from 'leaflet'
import { ArrowLeft, Save } from 'lucide-react'
import EditorToolbar, { type Tool } from '../components/editor/EditorToolbar'
import MapCanvas from '../components/editor/MapCanvas'
import PropertiesPanel, {
  type BuildingFormData,
  type ScheduleEntry,
} from '../components/editor/PropertiesPanel'
import { buildingsApi } from '../api/buildings'
import { spacesApi } from '../api/spaces'
import type { Space } from '../types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DrawnSpace {
  id:      string
  type:    string          // 'polygon' | 'rectangle' | 'polyline' | 'marker'
  latlngs: L.LatLng[]
  layer:   L.Layer
}

const DEFAULT_SCHEDULES: ScheduleEntry[] = [
  { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true  },
  { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true  },
  { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true  },
  { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true  },
  { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true  },
  { day_of_week: 6, start_time: '09:00', end_time: '14:00', is_active: false },
  { day_of_week: 0, start_time: '09:00', end_time: '14:00', is_active: false },
]


const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332]

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapEditorPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id?: string }>()

  const [tool,    setTool]    = useState<Tool>('select')
  const [saving,  setSaving]  = useState(false)
  const [savedId, setSavedId] = useState<number | null>(id ? Number(id) : null)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mapKey,  setMapKey]  = useState(0)

  const [form, setForm] = useState<BuildingFormData>({
    name:        '',
    type:        '',
    latitude:    '',
    longitude:   '',
    description: '',
  })

  const [schedules,      setSchedules]      = useState<ScheduleEntry[]>(DEFAULT_SCHEDULES)
  const [spaces,         setSpaces]         = useState<DrawnSpace[]>([])
  const [initialSpaces,  setInitialSpaces]  = useState<Space[]>([])
  const [loading,        setLoading]        = useState(!!id)

  // ── Cargar datos del edificio existente al editar ─────────────────────────
  useEffect(() => {
    if (!id) return
    buildingsApi.show(Number(id))
      .then((b) => {
        setForm({
          name:        b.name        ?? '',
          type:        b.type        ?? '',
          latitude:    b.latitude    != null ? String(b.latitude)  : '',
          longitude:   b.longitude   != null ? String(b.longitude) : '',
          description: b.description ?? '',
        })
        setInitialSpaces(b.spaces ?? [])
      })
      .catch(() => setError('No se pudo cargar el edificio.'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Derived map center ─────────────────────────────────────────────────────

  const mapCenter: [number, number] =
    form.latitude && form.longitude
      ? [parseFloat(form.latitude), parseFloat(form.longitude)]
      : DEFAULT_CENTER

  // ── Canvas handlers ───────────────────────────────────────────────────────

  const handleSpacesLoaded = (loaded: DrawnSpace[]) => {
    setSpaces(loaded)
  }

  const handleSpaceCreated = (space: DrawnSpace) => {
    setSpaces((prev) => [...prev, space])
    // Auto-fill lat/lng from the centroid of the shape if empty
    if (!form.latitude && !form.longitude && space.latlngs.length > 0) {
      const lat = space.latlngs.reduce((s, p) => s + p.lat, 0) / space.latlngs.length
      const lng = space.latlngs.reduce((s, p) => s + p.lng, 0) / space.latlngs.length
      setForm((f) => ({
        ...f,
        latitude:  lat.toFixed(6),
        longitude: lng.toFixed(6),
      }))
    }

    setTool('select')
  }

  const handleSpaceEdited = (id: string, latlngs: L.LatLng[]) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, latlngs } : s)),
    )
  }

  const handleSpaceDeleted = (id: string) => {
    setSpaces((prev) => prev.filter((s) => s.id !== id))
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre del edificio es requerido.'); return }
    if (!form.type)         { setError('Selecciona el tipo de edificio.');      return }

    setError(null)
    setSaving(true)

    try {
      let buildingId = savedId

      const buildingPayload = {
        name:        form.name,
        type:        form.type,
        description: form.description || undefined,
        latitude:    form.latitude  ? parseFloat(form.latitude)  : null,
        longitude:   form.longitude ? parseFloat(form.longitude) : null,
      }

      if (!buildingId) {
        const b = await buildingsApi.store(buildingPayload)
        buildingId = b.id
        setSavedId(buildingId)
      } else {
        await buildingsApi.update(buildingId, buildingPayload)
      }

      // When editing and new shapes were drawn, replace all existing spaces
      if (savedId && spaces.length > 0) {
        const existing = await spacesApi.list(savedId)
        await Promise.all(existing.map((s) => spacesApi.destroy(s.id)))
      }

      // Save each drawn space
      if (buildingId && spaces.length > 0) {
        for (const space of spaces) {
          await spacesApi.store(buildingId, {
            name: `${capitalize(space.type)} ${spaces.indexOf(space) + 1}`,
            type: 'classroom',
            polygon_data: space.latlngs.map((ll) => ({
              x: ll.lat,
              y: ll.lng,
            })),
          })
        }
      }

      // Reload fresh spaces from DB so the map state matches what was saved
      if (buildingId) {
        try {
          const fresh = await buildingsApi.show(buildingId)
          setInitialSpaces(fresh.spaces ?? [])
        } catch {
          setInitialSpaces([])
        }
      }

      setSpaces([])
      setMapKey((k) => k + 1)   // remount MapCanvas with fresh initialSpaces
      setSuccess('Edificio guardado correctamente.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error desconocido'
      setError(`Error al guardar: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.7} />
          </button>

          <div>
            <p className="text-base font-semibold text-gray-900 leading-5">
              {form.name || 'Nuevo Mapa'}
            </p>
            <p className="text-xs text-gray-400">Editor de mapas · OpenStreetMap</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <p className="max-w-xs rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700">
              {success}
            </p>
          )}

          <div className="text-xs text-gray-400">
            {spaces.length > 0 && `${spaces.length} forma${spaces.length !== 1 ? 's' : ''} dibujada${spaces.length !== 1 ? 's' : ''}`}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={1.7} />
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </header>

      {/* ── Editor body ──────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">

        {/* Left toolbar */}
        <EditorToolbar activeTool={tool} onToolChange={setTool} />

        {/* Map canvas */}
        <MapCanvas
          key={mapKey}
          tool={tool}
          center={mapCenter}
          initialSpaces={initialSpaces}
          onSpacesLoaded={handleSpacesLoaded}
          onSpaceCreated={handleSpaceCreated}
          onSpaceEdited={handleSpaceEdited}
          onSpaceDeleted={handleSpaceDeleted}
        />

        {/* Right panel */}
        <PropertiesPanel
          form={form}
          onFormChange={setForm}
          schedules={schedules}
          onScheduleChange={setSchedules}
          onSave={() => void handleSave()}
          saving={saving}
        />

      </div>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
