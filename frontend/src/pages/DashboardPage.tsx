import { Building2, Clock, Eye, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
  label, value, sub, icon: Icon, iconBgClass, iconClass,
}: {
  label: string
  value: string
  sub: string
  icon: typeof MapPin
  iconBgClass: string
  iconClass: string
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-normal text-[#6A7282]">{label}</p>
          <p className="text-3xl font-bold leading-9 text-[#101828]">{value}</p>
          <p className="text-sm font-normal text-[#00A63E]">{sub}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}>
          <Icon className={`h-6 w-6 ${iconClass}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function StatusPill({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#DBEAFE] px-2.5 py-0.5 text-xs font-medium text-[#1D4ED8]">
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

          <div>
            <h1 className="text-3xl font-bold leading-9 text-[#101828]">Dashboard</h1>
            <p className="mt-2 text-base font-normal text-[#6A7282]">
              Bienvenido de nuevo, {welcome}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Edificios"
              value={isLoading ? '…' : String(total)}
              sub="en tu cuenta"
              icon={MapPin}
              iconBgClass="bg-[#DBEAFE]"
              iconClass="text-[#155DFC]"
            />
            <StatCard
              label="Esta Página"
              value={isLoading ? '…' : String(buildings.length)}
              sub="mostrados ahora"
              icon={Building2}
              iconBgClass="bg-[#DCFCE7]"
              iconClass="text-[#00A63E]"
            />
            <StatCard
              label="Vistas Públicas"
              value="—"
              sub="próximamente"
              icon={Eye}
              iconBgClass="bg-[#F3E8FF]"
              iconClass="text-[#9810FA]"
            />
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm shadow-black/5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-normal text-[#6A7282]">Última Actividad</p>
                  <p className="text-3xl font-bold leading-9 text-[#101828]">
                    {isLoading ? '…' : lastUpdated}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD4]">
                  <Clock className="h-6 w-6 text-[#F54900]" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm shadow-black/5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold leading-7 text-[#101828]">Edificios Recientes</h2>
              <a href="/maps" className="text-sm font-normal text-[#2563EB] hover:underline">
                Ver todos
              </a>
            </div>

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
              </div>
            )}

            {!isLoading && buildings.length === 0 && (
              <p className="py-4 text-center text-sm text-[#6A7282]">
                No hay edificios aún. ¡Crea el primero!
              </p>
            )}

            {!isLoading && buildings.length > 0 && (
              <div className="-mx-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      {['Nombre', 'Tipo', 'Espacios', 'Actualizado'].map((h) => (
                        <th key={h} className="px-6 py-3 text-sm font-medium text-[#364153]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0">
                        <td className="px-6 py-4 text-base font-medium text-[#101828]">{b.name}</td>
                        <td className="px-6 py-4"><StatusPill type={b.type} /></td>
                        <td className="px-6 py-4 text-base text-[#4A5565]">{b.spaces_count ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-[#4A5565]">
                          {new Date(b.updated_at).toLocaleDateString('es-MX')}
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
