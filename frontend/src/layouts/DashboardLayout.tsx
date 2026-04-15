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
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex h-12 w-full items-center gap-3 rounded-lg px-4 text-base transition-colors',
    isActive
      ? 'bg-[#EFF6FF] font-medium text-[#2563EB]'
      : 'font-normal text-[#364153] hover:bg-gray-50',
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
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#155DFC] to-[#1447E6]">
              <MapPin className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-lg font-bold leading-7 text-[#101828]">MapBuilder</p>
              <p className="text-xs font-normal text-[#6A7282]">SaaS Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-auto px-4 py-6">
          <NavLink to="/dashboard" end className={navItemClass}>
            <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={1.67} />
            Inicio
          </NavLink>
          <NavLink to="/maps" className={navItemClass}>
            <Map className="h-5 w-5 shrink-0" strokeWidth={1.67} />
            Mis Mapas
          </NavLink>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-base font-normal text-[#364153] hover:bg-gray-50"
          >
            <Plus className="h-5 w-5 shrink-0" strokeWidth={1.67} />
            Crear Mapa
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-base font-normal text-[#364153] hover:bg-gray-50"
          >
            <BarChart3 className="h-5 w-5 shrink-0" strokeWidth={1.67} />
            Reportes
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-base font-normal text-[#364153] hover:bg-gray-50"
          >
            <Download className="h-5 w-5 shrink-0" strokeWidth={1.67} />
            Exportar
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-base font-normal text-[#364153] hover:bg-gray-50"
          >
            <Settings className="h-5 w-5 shrink-0" strokeWidth={1.67} />
            Configuración
          </button>
        </nav>

        <div className="border-t border-[#E5E7EB] px-6 py-4">
          <p className="text-center text-xs font-normal text-[#6A7282]">© 2026 MapBuilder SaaS</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
          <div className="relative max-w-xl flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#99A1AF]"
              strokeWidth={1.67}
            />
            <input
              type="search"
              placeholder="Buscar mapas, edificios..."
              className="h-11 w-full rounded-lg border border-[#D1D5DC] bg-white py-2 pl-10 pr-4 text-base text-[#101828] placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              readOnly
              aria-label="Buscar (próximamente)"
            />
          </div>

          <div className="flex items-center gap-3 pl-4">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#4A5565] hover:bg-gray-100"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" strokeWidth={1.67} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FB2C36]" />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-3 rounded-lg py-1 pl-3 pr-2 hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2B7FFF] to-[#155DFC] text-xs font-medium text-white">
                  {userInitials(user?.name)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-[#101828]">{displayName}</p>
                  <p className="text-xs font-normal text-[#6A7282]">{roleLabel(user?.roles)}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#99A1AF]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      void handleLogout()
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#364153] hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#F9FAFB]">{children}</div>
      </div>
    </div>
  )
}

