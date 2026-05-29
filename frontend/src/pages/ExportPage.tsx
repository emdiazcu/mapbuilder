import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Download, Filter, Pencil, Search, Trash2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { buildingsApi } from '../api/buildings'
import type { Building } from '../types'

const TYPE_LABELS: Record<string, string> = {
  school:     'Escuela',
  commercial: 'Plaza Comercial',
  office:     'Oficina',
  dependency: 'Dependencia',
}

function exportToCSV(buildings: Building[]) {
  const headers = ['Nombre', 'Tipo', 'Latitud', 'Longitud', 'Estado', 'Espacios', 'Creado']
  const rows = buildings.map((b) => [
    b.name,
    TYPE_LABELS[b.type] ?? b.type,
    b.latitude != null  ? b.latitude.toFixed(4)  : '-',
    b.longitude != null ? b.longitude.toFixed(4) : '-',
    'Activo',
    b.spaces_count ?? 0,
    new Date(b.created_at).toLocaleDateString('es-MX'),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `edificios-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [search,      setSearch]      = useState('')
  const [type,        setType]        = useState('')
  const [page,        setPage]        = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const queryKey = ['buildings-export', { search, type, page }]

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => buildingsApi.list({ search: search || undefined, type: type || undefined, page, per_page: 5 }),
  })

  // For export we fetch all matching records (up to 500)
  const { refetch: fetchAll, isFetching: isExporting } = useQuery({
    queryKey: ['buildings-export-all', { search, type }],
    queryFn:  () => buildingsApi.list({ search: search || undefined, type: type || undefined, page: 1, per_page: 500 }),
    enabled:  false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => buildingsApi.destroy(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<typeof data>(queryKey, (old) =>
        old
          ? { ...old, data: old.data.filter((b) => b.id !== id), meta: { ...old.meta, total: old.meta.total - 1 } }
          : old
      )
    },
  })

  const handleDelete = (b: Building) => {
    if (!window.confirm(`¿Eliminar "${b.name}"? Esta acción no se puede deshacer.`)) return
    deleteMutation.mutate(b.id)
  }

  const handleExport = async () => {
    const result = await fetchAll()
    if (result.data?.data) exportToCSV(result.data.data)
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
              <h1 className="text-2xl font-bold text-gray-900">Exportar Datos</h1>
              <p className="mt-1 text-base text-gray-500">Gestiona y exporta la información de edificios</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exportando…' : 'Exportar a Excel'}
            </button>
          </div>

          {/* Filtros */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar edificio..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1) }}
                className="h-10 min-w-[180px] rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="school">Escuela</option>
                <option value="commercial">Plaza Comercial</option>
                <option value="office">Oficina</option>
                <option value="dependency">Dependencia</option>
              </select>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={[
                  'inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
                  showFilters
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
              {(search || type) && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setType(''); setPage(1) }}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Limpiar
                </button>
              )}
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Estado</label>
                  <select className="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500">
                    <option value="">Todos</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Ordenar por</label>
                  <select className="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500">
                    <option value="created_at">Fecha de creación</option>
                    <option value="name">Nombre</option>
                    <option value="type">Tipo</option>
                  </select>
                </div>
              </div>
            )}

            {meta && (
              <p className="text-xs text-gray-500">
                Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total} resultados
              </p>
            )}
          </div>

          {/* Tabla */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudieron cargar los edificios.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Nombre', 'Tipo', 'Latitud', 'Longitud', 'Horario', 'Estado', 'Acciones'].map((h) => (
                        <th key={h} className="px-6 py-3 font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                          No hay edificios que coincidan con los filtros.
                        </td>
                      </tr>
                    ) : (
                      buildings.map((b) => (
                        <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{b.name}</td>
                          <td className="px-6 py-4 text-gray-600">{TYPE_LABELS[b.type] ?? b.type}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {b.latitude != null ? b.latitude.toFixed(4) : '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {b.longitude != null ? b.longitude.toFixed(4) : '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">—</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              Activo
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => navigate(`/editor/${b.id}`)}
                                className="text-gray-400 hover:text-blue-600"
                                aria-label="Editar"
                              >
                                <Pencil className="h-4 w-4" strokeWidth={1.7} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(b)}
                                className="text-gray-400 hover:text-red-600"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

        </div>
      </main>
    </DashboardLayout>
  )
}
