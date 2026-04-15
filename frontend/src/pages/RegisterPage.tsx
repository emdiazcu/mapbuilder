import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import { useAuth } from '../contexts/AuthContext'
import type { ApiError } from '../types'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [name,                 setName]                 = useState('')
  const [email,                setEmail]                = useState('')
  const [password,             setPassword]             = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword,         setShowPassword]         = useState(false)
  const [errors,               setErrors]               = useState<Record<string, string>>({})
  const [loading,              setLoading]              = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: 'Las contraseñas no coinciden.' })
      return
    }

    setLoading(true)
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation })
      navigate('/dashboard')
    } catch (err: unknown) {
      const apiErr = (err as { response?: { data?: ApiError } }).response?.data
      if (apiErr?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(apiErr.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        setErrors({ general: apiErr?.message ?? 'Error al crear la cuenta.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Crear Cuenta" subtitle="Regístrate para continuar">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {errors.general && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.general}
          </p>
        )}

        {/* Nombre Completo */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#364153] mb-2">
            Nombre Completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full h-[46px] rounded-lg border px-4 py-[10px] text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${
              errors.name ? 'border-red-400' : 'border-[#D1D5DC]'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Correo Electrónico */}
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
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full h-[46px] rounded-lg border px-4 py-[10px] text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${
              errors.password ? 'border-red-400' : 'border-[#D1D5DC]'
            }`}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}

          <label className="flex items-center gap-2 mt-2 text-sm text-[#4A5565] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 rounded border-[#D1D5DC] text-[#2563EB] focus:ring-[#2563EB]"
            />
            Mostrar contraseña
          </label>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-[#364153] mb-2">
            Confirmar Contraseña
          </label>
          <input
            id="password_confirmation"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className={`w-full h-[46px] rounded-lg border px-4 py-[10px] text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${
              errors.password_confirmation ? 'border-red-400' : 'border-[#D1D5DC]'
            }`}
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Botón */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-base font-medium rounded-lg shadow-sm transition"
          >
            {loading ? 'Creando cuenta…' : 'Crear Cuenta'}
          </button>
        </div>

        {/* Link a login */}
        <p className="text-center text-sm text-[#4A5565] mt-8">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sm font-medium text-[#2563EB] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
