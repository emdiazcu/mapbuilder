import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  ChevronDown,
  Download,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Plus,
  Search,
  Settings,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function roleLabel(roles: { name: string }[] | undefined) {
  const r = roles?.[0]?.name?.toLowerCase()
  if (r === 'admin') return 'Admin'
  if (!r) return 'Usuario'
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function userInitials(name: string | undefined) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex h-12 w-full items-center gap-3 rounded-lg px-4 text-base transition-colors',
    isActive
      ? 'bg-blue-50 font-medium text-blue-600'
      : 'font-normal text-gray-700 hover:bg-gray-50',
  ].join(' ')

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [userMenuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.name ?? 'Usuario'

  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">

        {/* Logo */}
        <div className="border-b border-gray-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <MapPin className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">MapBuilder</p>
              <p className="text-xs text-gray-400">SaaS Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-auto px-4 py-6">
          <NavLink to="/dashboard" end className={navItemClass}>
            <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Inicio
          </NavLink>
          <NavLink to="/maps" className={navItemClass}>
            <Map className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Mis Mapas
          </NavLink>
          <NavLink to="/editor" className={navItemClass}>
            <Plus className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Crear Mapa
          </NavLink>
          <NavLink to="/reports" className={navItemClass}>
            <BarChart3 className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Reportes
          </NavLink>
          <NavLink to="/export" className={navItemClass}>
            <Download className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Exportar
          </NavLink>
          <NavLink to="/settings" className={navItemClass}>
            <Settings className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Configuración
          </NavLink>
        </nav>

        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-center text-xs text-gray-400">© {new Date().getFullYear()} MapBuilder SaaS</p>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="relative max-w-xl flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              strokeWidth={1.7}
            />
            <input
              type="search"
              placeholder="Buscar mapas, edificios..."
              className="h-11 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              readOnly
              aria-label="Buscar (próximamente)"
            />
          </div>

          <div className="flex items-center gap-3 pl-4">
            {/* Notificaciones */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" strokeWidth={1.7} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-3 rounded-lg py-1 pl-3 pr-2 hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-medium text-white">
                  {userInitials(user?.name)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-400">{roleLabel(user?.roles)}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); void handleLogout() }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  )
}
