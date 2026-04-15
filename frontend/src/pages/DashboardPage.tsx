import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="font-bold text-gray-900 text-lg">MapBuilder</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido — placeholder hasta FASE 4 completa */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Edificios</h1>
        <p className="text-gray-500 text-sm">Bienvenido, {user?.name}. Aquí verás tus edificios.</p>
      </main>
    </div>
  )
}
