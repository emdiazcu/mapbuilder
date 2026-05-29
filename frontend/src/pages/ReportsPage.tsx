import { useQuery } from '@tanstack/react-query'
import { BarChart3, Building2, Eye, TrendingUp, Users } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { buildingsApi } from '../api/buildings'

// ── Stat card (mismo patrón que Dashboard) ────────────────────────────────
function StatCard({
  label, value, sub, subClass = 'text-green-600',
  icon: Icon, iconBg, iconColor,
}: {
  label: string; value: string; sub: string; subClass?: string
  icon: typeof Eye; iconBg: string; iconColor: string
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

// ── Gráfica de líneas: Vistas Mensuales ────────────────────────────────────
const LINE_DATA = [
  { month: 'Ene', value: 360  },
  { month: 'Feb', value: 630  },
  { month: 'Mar', value: 780  },
  { month: 'Abr', value: 840  },
  { month: 'May', value: 1420 },
  { month: 'Jun', value: 1280 },
]

function LineChart() {
  const W = 360, H = 180, padL = 44, padB = 28, padT = 12, padR = 8
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const maxV  = 1400

  const pts = LINE_DATA.map((d, i) => ({
    x: padL + (i / (LINE_DATA.length - 1)) * plotW,
    y: padT + (1 - Math.min(d.value, maxV) / maxV) * plotH,
    ...d,
  }))

  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`

  const yTicks = [0, 350, 700, 1050, 1400]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full">
      {yTicks.map((v) => {
        const y = padT + (1 - v / maxV) * plotH
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
          </g>
        )
      })}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={lineD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
      ))}
      {pts.map((p) => (
        <text key={p.month} x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">{p.month}</text>
      ))}
    </svg>
  )
}

// ── Gráfica de pastel: Edificios por Tipo ─────────────────────────────────
const PIE_DATA = [
  { label: 'Escuelas',     pct: 45, color: '#3b82f6' },
  { label: 'Oficinas',     pct: 25, color: '#22c55e' },
  { label: 'Plazas',       pct: 20, color: '#f59e0b' },
  { label: 'Dependencias', pct: 10, color: '#ef4444' },
]

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
}

function PieChart() {
  let start = 0
  const segments = PIE_DATA.map((d) => {
    const deg = (d.pct / 100) * 360
    const path = arc(100, 100, 80, start, start + deg)
    start += deg
    return { ...d, path }
  })

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox="0 0 200 200" className="h-48 w-48 shrink-0">
        {segments.map((s) => (
          <path key={s.label} d={s.path} fill={s.color} />
        ))}
      </svg>
      <ul className="space-y-2 pt-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-gray-700">{s.label}</span>
            <span className="ml-auto font-medium text-gray-900">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Gráfica de barras: Mapas Más Visitados ────────────────────────────────
const BAR_DATA = [
  { label: 'Centro Comercial',    value: 2400 },
  { label: 'Campus Univ.',        value: 1850 },
  { label: 'Zona Industrial',     value: 1220 },
  { label: 'Complejo Res.',       value: 1050 },
]

function BarChart() {
  const W = 380, H = 190, padL = 44, padB = 36, padT = 12, padR = 8
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const maxV  = 2400
  const n = BAR_DATA.length
  const gap = 16
  const barW = (plotW - gap * (n - 1)) / n

  const yTicks = [0, 600, 1200, 1800, 2400]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full">
      {yTicks.map((v) => {
        const y = padT + (1 - v / maxV) * plotH
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
          </g>
        )
      })}
      {BAR_DATA.map((d, i) => {
        const bH = (d.value / maxV) * plotH
        const x  = padL + i * (barW + gap)
        const y  = padT + plotH - bH
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={bH} fill="#3b82f6" rx="4" />
            <text
              x={x + barW / 2} y={H - 4}
              textAnchor="middle" fontSize="9" fill="#9ca3af"
            >{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Tabla resumen de mapas ────────────────────────────────────────────────
const SUMMARY = [
  { name: 'Campus Universitario', sub: '24 edificios', views: '2,340' },
  { name: 'Centro Comercial',     sub: '12 edificios', views: '1,890' },
  { name: 'Zona Industrial',      sub: '8 edificios',  views: '1,234' },
  { name: 'Complejo Residencial', sub: '32 edificios', views: '987'   },
]

// ── Página ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['buildings', { page: 1 }],
    queryFn:  () => buildingsApi.list({ page: 1 }),
  })

  const totalBuildings = data?.meta?.total ?? 0

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
            <p className="mt-2 text-base text-gray-500">Estadísticas y métricas de tus mapas</p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Vistas"
              value="5,634"
              sub="+23% este mes"
              icon={Eye}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              label="Edificios Totales"
              value={isLoading ? '…' : String(totalBuildings)}
              sub="+8% este mes"
              icon={Building2}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              label="Visitantes Únicos"
              value="2,451"
              sub="+15% este mes"
              icon={Users}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatCard
              label="Tasa de Crecimiento"
              value="18.5%"
              sub="vs mes anterior"
              subClass="text-orange-500"
              icon={TrendingUp}
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
            />
          </div>

          {/* Fila de gráficas superiores */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Vistas Mensuales */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Vistas Mensuales</h2>
              <p className="mt-0.5 text-sm text-gray-500">Crecimiento de vistas en los últimos 6 meses</p>
              <div className="mt-4">
                <LineChart />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>views</span>
              </div>
            </section>

            {/* Edificios por Tipo */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Edificios por Tipo</h2>
              <p className="mt-0.5 text-sm text-gray-500">Distribución de tipos de edificios</p>
              <div className="mt-4">
                <PieChart />
              </div>
            </section>

          </div>

          {/* Fila de gráficas inferiores */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Mapas más visitados */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Mapas Más Visitados</h2>
              <p className="mt-0.5 text-sm text-gray-500">Top 4 mapas con más vistas</p>
              <div className="mt-4">
                <BarChart />
              </div>
            </section>

            {/* Resumen de mapas */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Resumen de Mapas</h2>
              <p className="mt-0.5 text-sm text-gray-500">Detalle de mapas principales</p>
              <ul className="mt-4 divide-y divide-gray-100">
                {SUMMARY.map((item) => (
                  <li key={item.name} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{item.views}</p>
                      <p className="text-xs text-gray-400">vistas</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
