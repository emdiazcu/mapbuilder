import { Building2, Clock, Eye, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'

const recentMaps = [
  {
    name: 'Centro Comercial Plaza Norte',
    buildings: 12,
    status: 'Activo' as const,
    updated: 'Hace 2 horas',
  },
  {
    name: 'Campus Universitario',
    buildings: 25,
    status: 'Activo' as const,
    updated: 'Hace 5 horas',
  },
  {
    name: 'Zona Industrial Este',
    buildings: 8,
    status: 'Borrador' as const,
    updated: 'Hace 1 día',
  },
]

function firstName(fullName: string | undefined) {
  if (!fullName) return 'Usuario'
  return fullName.split(/\s+/)[0] ?? fullName
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconBgClass,
  iconClass,
}: {
  label: string
  value: string
  delta: string
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
          <p className="text-sm font-normal text-[#00A63E]">{delta}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}
        >
          <Icon className={`h-6 w-6 ${iconClass}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: 'Activo' | 'Borrador' }) {
  if (status === 'Activo') {
    return (
      <span className="inline-flex rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-medium text-[#016630]">
        Activo
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-[#FEF9C2] px-2.5 py-0.5 text-xs font-medium text-[#894B00]">
      Borrador
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const welcome = firstName(user?.name)

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
              label="Total Mapas"
              value="24"
              delta="+12% vs último mes"
              icon={MapPin}
              iconBgClass="bg-[#DBEAFE]"
              iconClass="text-[#155DFC]"
            />
            <StatCard
              label="Edificios Registrados"
              value="156"
              delta="+8% vs último mes"
              icon={Building2}
              iconBgClass="bg-[#DCFCE7]"
              iconClass="text-[#00A63E]"
            />
            <StatCard
              label="Visitas Públicas"
              value="1,234"
              delta="+23% vs último mes"
              icon={Eye}
              iconBgClass="bg-[#F3E8FF]"
              iconClass="text-[#9810FA]"
            />
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm shadow-black/5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-normal text-[#6A7282]">Última Actividad</p>
                  <p className="text-3xl font-bold leading-9 text-[#101828]">Hace 2h</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD4]">
                  <Clock className="h-6 w-6 text-[#F54900]" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm shadow-black/5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold leading-7 text-[#101828]">Mapas Recientes</h2>
              <button type="button" className="text-sm font-normal text-[#2563EB] hover:underline">
                Ver todos
              </button>
            </div>

            <div className="-mx-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-6 py-3 text-sm font-medium text-[#364153]">Nombre</th>
                    <th className="px-6 py-3 text-sm font-medium text-[#364153]">Edificios</th>
                    <th className="px-6 py-3 text-sm font-medium text-[#364153]">Estado</th>
                    <th className="px-6 py-3 text-sm font-medium text-[#364153]">Actualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMaps.map((row) => (
                    <tr key={row.name} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="px-6 py-4 text-base font-medium text-[#101828]">{row.name}</td>
                      <td className="px-6 py-4 text-base font-normal text-[#4A5565]">
                        {row.buildings}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-[#4A5565]">{row.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
