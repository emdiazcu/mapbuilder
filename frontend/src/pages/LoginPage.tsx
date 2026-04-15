import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import { useAuth } from '../contexts/AuthContext'
import type { ApiError } from '../types'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const apiErr = (err as { response?: { data?: ApiError } }).response?.data
      if (apiErr?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(apiErr.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setErrors({ general: apiErr?.message ?? 'Error al iniciar sesión.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthCard title="Iniciar Sesión" subtitle="Ingresa a tu cuenta">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {errors.general && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.general}
          </p>
        )}

        {/* Correo */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#364153] mb-2">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full h-[46px] rounded-lg border px-4 py-[10px] text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${
              errors.email ? 'border-red-400' : 'border-[#D1D5DC]'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#364153] mb-2">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full h-[46px] rounded-lg border px-4 py-[10px] text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${
              errors.password ? 'border-red-400' : 'border-[#D1D5DC]'
            }`}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        {/* Recuérdame + olvidé contraseña */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-base font-medium text-[#4A5565] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-[#D1D5DC] text-[#2563EB] focus:ring-[#2563EB]"
            />
            Recordarme
          </label>
          <a href="#" className="text-sm text-[#2563EB] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-base font-medium rounded-lg shadow-sm transition"
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
          </button>
        </div>

        {/* Link a registro */}
        <p className="text-center text-sm text-[#4A5565] mt-8">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-sm font-medium text-[#2563EB] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
