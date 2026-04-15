import { useMemo, useState } from 'react'
import { Building2, Eye, Map as MapIcon, MoreVertical, Plus } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

type MapStatus = 'Activo' | 'Borrador'

type MapCardModel = {
  id: string
  name: string
  buildings: number
  views: number
  status: MapStatus
  updated: string
  gradient: string
}

function StatusPill({ status }: { status: MapStatus }) {
  if (status === 'Activo') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-medium text-[#016630] ring-1 ring-inset ring-[#B9F8CF]">
        Activo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#FEF9C2] px-2.5 py-0.5 text-xs font-medium text-[#894B00] ring-1 ring-inset ring-[#FFF085]">
      Borrador
    </span>
  )
}

function ViewToggle({
  view,
  onChange,
}: {
  view: 'grid' | 'list'
  onChange: (next: 'grid' | 'list') => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={[
          'h-10 rounded-lg px-4 text-base font-medium transition-colors',
          view === 'grid' ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#4A5565] hover:bg-gray-200',
        ].join(' ')}
        aria-pressed={view === 'grid'}
      >
        Vista Grid
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={[
          'h-10 rounded-lg px-4 text-base font-medium transition-colors',
          view === 'list' ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#4A5565] hover:bg-gray-200',
        ].join(' ')}
        aria-pressed={view === 'list'}
      >
        Vista Lista
      </button>
    </div>
  )
}

function Metric({ icon: Icon, label }: { icon: typeof Building2; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#4A5565]">
      <Icon className="h-4 w-4" strokeWidth={1.67} />
      <span className="leading-5">{label}</span>
    </div>
  )
}

function MapCard({ item }: { item: MapCardModel }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm shadow-black/5">
      <div className={`relative h-40 ${item.gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="flex h-16 w-16 items-center justify-center">
            <MapIcon className="h-12 w-12 text-white/80" strokeWidth={2} />
          </div>
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
            <span className="line-clamp-1">{item.name}</span>
          </h3>
          <StatusPill status={item.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Metric icon={Building2} label={`${item.buildings} edificios`} />
          <Metric icon={Eye} label={`${item.views} vistas`} />
        </div>

        <p className="mt-3 text-xs font-normal leading-4 text-[#6A7282]">{item.updated}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg border border-[#D1D5DC] bg-white px-3 py-2 text-sm font-medium text-[#364153] hover:bg-gray-50"
          >
            Ver Mapa
          </button>
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

export default function MyMapsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const maps = useMemo<MapCardModel[]>(
    () => [
      {
        id: 'campus-norte',
        name: 'Campus Universitario Norte',
        buildings: 24,
        views: 1234,
        status: 'Activo',
        updated: 'Actualizado Hace 2 horas',
        gradient: 'bg-gradient-to-br from-[#51A2FF] to-[#155DFC]',
      },
      {
        id: 'centro-plaza',
        name: 'Centro Comercial Plaza',
        buildings: 12,
        views: 856,
        status: 'Activo',
        updated: 'Actualizado Hace 5 horas',
        gradient: 'bg-gradient-to-br from-[#C27AFF] to-[#9810FA]',
      },
      {
        id: 'zona-industrial',
        name: 'Zona Industrial Este',
        buildings: 8,
        views: 234,
        status: 'Borrador',
        updated: 'Actualizado Hace 1 día',
        gradient: 'bg-gradient-to-br from-[#05DF72] to-[#00A63E]',
      },
      {
        id: 'residencial',
        name: 'Complejo Residencial',
        buildings: 32,
        views: 2100,
        status: 'Activo',
        updated: 'Actualizado Hace 3 días',
        gradient: 'bg-gradient-to-br from-[#FF8904] to-[#F54900]',
      },
    ],
    [],
  )

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold leading-8 text-[#101828]">Mis Mapas</h1>
              <p className="text-base font-normal leading-6 text-[#6A7282]">
                {maps.length} mapas creados
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-base font-medium text-white shadow-sm shadow-black/10 hover:bg-[#1D4ED8]"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo Mapa
            </button>
          </div>

          <div className="mt-6">
            <ViewToggle view={view} onChange={setView} />
          </div>

          {view === 'grid' ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {maps.map((m) => (
                <MapCard key={m.id} item={m} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-6 text-sm text-[#4A5565]">
              Vista Lista (próximamente)
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}

