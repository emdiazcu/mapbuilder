import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Eye, Map as MapIcon, MoreVertical, Plus, Search } from 'lucide-react'
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
  school:     'bg-gradient-to-br from-[#51A2FF] to-[#155DFC]',
  commercial: 'bg-gradient-to-br from-[#C27AFF] to-[#9810FA]',
  office:     'bg-gradient-to-br from-[#05DF72] to-[#00A63E]',
  dependency: 'bg-gradient-to-br from-[#FF8904] to-[#F54900]',
}

function StatusPill({ type }: { type: string }) {
  const label = TYPE_LABELS[type] ?? type
  return (
    <span className="inline-flex items-center rounded-full bg-[#DBEAFE] px-2.5 py-0.5 text-xs font-medium text-[#1D4ED8] ring-1 ring-inset ring-[#BFDBFE]">
      {label}
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
              ? 'bg-[#2563EB] text-white'
              : 'bg-[#F3F4F6] text-[#4A5565] hover:bg-gray-200',
          ].join(' ')}
          aria-pressed={view === v}
        >
          Vista {v === 'grid' ? 'Grid' : 'Lista'}
        </button>
      ))}
    </div>
  )
}

function BuildingCard({ building }: { building: Building }) {
  const gradient = TYPE_GRADIENTS[building.type] ?? 'bg-gradient-to-br from-gray-400 to-gray-600'
  const updatedAt = new Date(building.updated_at).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm shadow-black/5">
      <div className={`relative h-40 ${gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <MapIcon className="h-12 w-12 text-white/80" strokeWidth={2} />
        </div>
        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#364153] hover:bg-white"
          aria-label="Opciones"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold leading-7 text-[#101828]">
            <span className="line-clamp-1">{building.name}</span>
          </h3>
          <StatusPill type={building.type} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-[#4A5565]">
            <Building2 className="h-4 w-4" strokeWidth={1.67} />
            <span>{building.spaces_count ?? 0} espacios</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4A5565]">
            <Eye className="h-4 w-4" strokeWidth={1.67} />
            <span>Vista pública</span>
          </div>
        </div>

        <p className="mt-3 text-xs font-normal leading-4 text-[#6A7282]">
          Actualizado {updatedAt}
        </p>

        <div className="mt-4 flex gap-2">
          <a
            href={building.public_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-lg border border-[#D1D5DC] bg-white px-3 py-2 text-center text-sm font-medium text-[#364153] hover:bg-gray-50"
          >
            Ver Mapa
          </a>
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white shadow-sm shadow-black/10 hover:bg-[#1D4ED8]"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  )
}

function BuildingRow({ building }: { building: Building }) {
  const updatedAt = new Date(building.updated_at).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  return (
    <tr className="border-b border-[#F3F4F6] last:border-0 hover:bg-gray-50">
      <td className="px-6 py-4 text-base font-medium text-[#101828]">{building.name}</td>
      <td className="px-6 py-4"><StatusPill type={building.type} /></td>
      <td className="px-6 py-4 text-sm text-[#4A5565]">{building.spaces_count ?? 0} espacios</td>
      <td className="px-6 py-4 text-sm text-[#4A5565]">{updatedAt}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <a
            href={building.public_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#2563EB] hover:underline"
          >
            Ver
          </a>
          <button type="button" className="text-sm text-[#2563EB] hover:underline">
            Editar
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function MyMapsPage() {
  const [view,   setView]   = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [type,   setType]   = useState('')
  const [page,   setPage]   = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['buildings', { search, type, page }],
    queryFn: () => buildingsApi.list({ search: search || undefined, type: type || undefined, page }),
  })

  const buildings = data?.data ?? []
  const meta      = data?.meta

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Encabezado */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold leading-8 text-[#101828]">Mis Mapas</h1>
              <p className="text-base font-normal leading-6 text-[#6A7282]">
                {meta ? `${meta.total} edificios registrados` : 'Cargando…'}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-base font-medium text-white shadow-sm hover:bg-[#1D4ED8]"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99A1AF]" />
              <input
                type="search"
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-10 w-full rounded-lg border border-[#D1D5DC] pl-9 pr-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              className="h-10 rounded-lg border border-[#D1D5DC] px-3 text-sm text-[#364153] outline-none focus:border-[#2563EB]"
            >
              <option value="">Todos los tipos</option>
              <option value="school">Escuela</option>
              <option value="commercial">Comercial</option>
              <option value="office">Oficina</option>
              <option value="dependency">Dependencia</option>
            </select>
            <ViewToggle view={view} onChange={setView} />
          </div>

          {/* Estados */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudieron cargar los edificios. Verifica tu conexión.
            </div>
          )}

          {!isLoading && !isError && buildings.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#D1D5DC] py-16 text-center">
              <MapIcon className="mb-3 h-12 w-12 text-[#99A1AF]" strokeWidth={1} />
              <p className="text-base font-medium text-[#364153]">No hay edificios aún</p>
              <p className="mt-1 text-sm text-[#6A7282]">Crea tu primer mapa para empezar</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && view === 'grid' && buildings.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((b) => <BuildingCard key={b.id} building={b} />)}
            </div>
          )}

          {/* Lista */}
          {!isLoading && view === 'list' && buildings.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="-mx-0 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      {['Nombre', 'Tipo', 'Espacios', 'Actualizado', 'Acciones'].map((h) => (
                        <th key={h} className="px-6 py-3 text-sm font-medium text-[#364153]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.map((b) => <BuildingRow key={b.id} building={b} />)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-[#6A7282]">
                Mostrando {meta.from}–{meta.to} de {meta.total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-9 rounded-lg border border-[#D1D5DC] px-4 text-sm font-medium text-[#364153] disabled:opacity-40 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 rounded-lg border border-[#D1D5DC] px-4 text-sm font-medium text-[#364153] disabled:opacity-40 hover:bg-gray-50"
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
