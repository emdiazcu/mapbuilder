import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, Map as MapIcon, MoreVertical, Plus, Search, Star, Trash2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { buildingsApi } from '../api/buildings'
import type { Building } from '../types'

const TYPE_LABELS: Record<string, string> = {
  school:     'Escuela',
  commercial: 'Comercial',
  office:     'Oficina',
  dependency: 'Dependencia',
}

const TYPE_GRADIENTS: Record<string, string> = {
  school:     'from-blue-400 to-blue-600',
  commercial: 'from-purple-400 to-purple-700',
  office:     'from-green-400 to-green-600',
  dependency: 'from-orange-400 to-orange-600',
}

function StatusPill({ type }: { type: string }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function ViewToggle({ view, onChange }: { view: 'grid' | 'list'; onChange: (v: 'grid' | 'list') => void }) {
  return (
    <div className="flex items-center gap-2">
      {(['grid', 'list'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={[
            'h-10 rounded-lg px-4 text-base font-medium transition-colors',
            view === v
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ].join(' ')}
          aria-pressed={view === v}
        >
          Vista {v === 'grid' ? 'Grid' : 'Lista'}
        </button>
      ))}
    </div>
  )
}

function CardMenu({ building, onFavorite, onDelete }: {
  building: Building
  onFavorite: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false)
  }

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-600 hover:bg-white"
        aria-label="Opciones"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => { onFavorite(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Star className={`h-4 w-4 ${building.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} strokeWidth={1.7} />
            {building.is_favorite ? 'Quitar favorito' : 'Marcar favorito'}
          </button>
          <button
            type="button"
            onClick={() => { onDelete(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.7} />
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

function BuildingCard({ building, onFavorite, onDelete }: {
  building: Building
  onFavorite: () => void
  onDelete: () => void
}) {
  const gradient = TYPE_GRADIENTS[building.type] ?? 'from-gray-400 to-gray-600'
  const updatedAt = new Date(building.updated_at).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <MapIcon className="h-12 w-12 text-white/80" strokeWidth={2} />
        </div>
        {building.is_favorite && (
          <div className="absolute left-3 top-3">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow" />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <CardMenu building={building} onFavorite={onFavorite} onDelete={onDelete} />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold text-gray-900">
            <span className="line-clamp-1">{building.name}</span>
          </h3>
          <StatusPill type={building.type} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" strokeWidth={1.7} />
            {building.spaces_count ?? 0} espacios
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" strokeWidth={1.7} />
            Vista pública
          </span>
        </div>

        <p className="mt-3 text-xs text-gray-400">Actualizado {updatedAt}</p>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/map/${building.public_token}`}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver Mapa
          </Link>
          <Link
            to={`/editor/${building.id}`}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Editar
          </Link>
        </div>
      </div>
    </div>
  )
}

function BuildingRow({ building, onFavorite, onDelete }: {
  building: Building
  onFavorite: () => void
  onDelete: () => void
}) {
  const updatedAt = new Date(building.updated_at).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900">
        <span className="flex items-center gap-2">
          {building.is_favorite && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
          {building.name}
        </span>
      </td>
      <td className="px-6 py-4"><StatusPill type={building.type} /></td>
      <td className="px-6 py-4 text-sm text-gray-600">{building.spaces_count ?? 0} espacios</td>
      <td className="px-6 py-4 text-sm text-gray-400">{updatedAt}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to={`/map/${building.public_token}`} className="text-sm text-blue-600 hover:underline">Ver</Link>
          <Link to={`/editor/${building.id}`} className="text-sm text-blue-600 hover:underline">Editar</Link>
          <button type="button" onClick={onFavorite} className="text-sm text-gray-500 hover:text-yellow-500">
            <Star className={`h-4 w-4 ${building.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} strokeWidth={1.7} />
          </button>
          <button type="button" onClick={onDelete} className="text-sm text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function MyMapsPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [view,   setView]   = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [type,   setType]   = useState('')
  const [page,   setPage]   = useState(1)

  const queryKey = ['buildings', { search, type, page }]

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => buildingsApi.list({ search: search || undefined, type: type || undefined, page }),
  })

  const favoriteMutation = useMutation({
    mutationFn: (id: number) => buildingsApi.toggleFavorite(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<typeof data>(queryKey, (old) =>
        old ? { ...old, data: old.data.map((b) => b.id === updated.id ? updated : b) } : old
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => buildingsApi.destroy(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<typeof data>(queryKey, (old) =>
        old ? { ...old, data: old.data.filter((b) => b.id !== id), meta: { ...old.meta, total: old.meta.total - 1 } } : old
      )
    },
  })

  const handleDelete = (building: Building) => {
    if (!window.confirm(`¿Eliminar "${building.name}"? Esta acción no se puede deshacer.`)) return
    deleteMutation.mutate(building.id)
  }

  const buildings = data?.data ?? []
  const meta      = data?.meta

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Encabezado */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Mapas</h1>
              <p className="mt-1 text-base text-gray-500">
                {meta ? `${meta.total} edificios registrados` : 'Cargando…'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="school">Escuela</option>
              <option value="commercial">Comercial</option>
              <option value="office">Oficina</option>
              <option value="dependency">Dependencia</option>
            </select>
            {(search || type) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setType(''); setPage(1) }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Limpiar
              </button>
            )}
            <ViewToggle view={view} onChange={setView} />
          </div>

          {/* Estados */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudieron cargar los edificios. Verifica tu conexión.
            </div>
          )}

          {!isLoading && !isError && buildings.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
              <MapIcon className="mb-3 h-12 w-12 text-gray-300" strokeWidth={1} />
              <p className="text-base font-medium text-gray-600">No hay edificios aún</p>
              <p className="mt-1 text-sm text-gray-400">Crea tu primer mapa para empezar</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && view === 'grid' && buildings.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((b) => (
                <BuildingCard
                  key={b.id}
                  building={b}
                  onFavorite={() => favoriteMutation.mutate(b.id)}
                  onDelete={() => handleDelete(b)}
                />
              ))}
            </div>
          )}

          {/* Lista */}
          {!isLoading && view === 'list' && buildings.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="-mx-0 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Nombre', 'Tipo', 'Espacios', 'Actualizado', 'Acciones'].map((h) => (
                        <th key={h} className="px-6 py-3 font-medium text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.map((b) => (
                      <BuildingRow
                        key={b.id}
                        building={b}
                        onFavorite={() => favoriteMutation.mutate(b.id)}
                        onDelete={() => handleDelete(b)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Mostrando {meta.from}–{meta.to} de {meta.total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-9 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </DashboardLayout>
  )
}
