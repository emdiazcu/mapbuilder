import { Building2, Clock, Eye, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'
import { buildingsApi } from '../api/buildings'

const TYPE_LABELS: Record<string, string> = {
  school:     'Escuela',
  commercial: 'Comercial',
  office:     'Oficina',
  dependency: 'Dependencia',
}

function firstName(fullName: string | undefined) {
  if (!fullName) return 'Usuario'
  return fullName.split(/\s+/)[0] ?? fullName
}

function StatCard({
  label, value, sub, subClass = 'text-green-600', icon: Icon, iconBg, iconColor,
}: {
  label: string
  value: string
  sub: string
  subClass?: string
  icon: typeof MapPin
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm ${subClass}`}>{sub}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function StatusPill({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const welcome  = firstName(user?.name)

  const { data, isLoading } = useQuery({
    queryKey: ['buildings', { page: 1 }],
    queryFn: () => buildingsApi.list({ page: 1 }),
  })

  const buildings = data?.data ?? []
  const total     = data?.meta?.total ?? 0

  const lastUpdated = buildings[0]
    ? new Date(buildings[0].updated_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-base text-gray-500">
              Bienvenido de nuevo, {welcome}
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Edificios"
              value={isLoading ? '…' : String(total)}
              sub="en tu cuenta"
              icon={MapPin}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              label="Esta Página"
              value={isLoading ? '…' : String(buildings.length)}
              sub="mostrados ahora"
              icon={Building2}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              label="Vistas Públicas"
              value="—"
              sub="próximamente"
              subClass="text-gray-400"
              icon={Eye}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Última Actividad</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? '…' : lastUpdated}
                  </p>
                  <p className="text-sm text-gray-400">
                    {buildings[0]
                      ? new Date(buildings[0].updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                      : 'Sin actividad'}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-500" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabla edificios recientes */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edificios Recientes</h2>
              <Link to="/maps" className="text-sm text-blue-600 hover:underline">
                Ver todos
              </Link>
            </div>

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            )}

            {!isLoading && buildings.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                No hay edificios aún. ¡Crea el primero!
              </p>
            )}

            {!isLoading && buildings.length > 0 && (
              <div className="-mx-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Nombre', 'Tipo', 'Espacios', 'Actualizado'].map((h) => (
                        <th key={h} className="px-6 py-3 font-medium text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                        <td className="px-6 py-4"><StatusPill type={b.type} /></td>
                        <td className="px-6 py-4 text-gray-600">{b.spaces_count ?? 0}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(b.updated_at).toLocaleDateString('es-MX', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </DashboardLayout>
  )
}
