import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import { useAuth } from '../contexts/AuthContext'
import type { ApiError } from '../types'

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [name,                 setName]                 = useState('')
  const [email,                setEmail]                = useState('')
  const [password,             setPassword]             = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword,         setShowPassword]         = useState(false)
  const [errors,               setErrors]               = useState<Record<string, string>>({})
  const [loading,              setLoading]              = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setErrors({})

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: 'Las contraseñas no coinciden.' })
      return
    }

    setLoading(true)
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation })
      navigate('/dashboard', { replace: true })
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

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const fieldClass = (field: string) =>
    `h-11 w-full rounded-lg border px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  return (
    <AuthCard title="Crear Cuenta" subtitle="Regístrate para continuar">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {errors.general && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errors.general}
          </p>
        )}

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Nombre Completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Correo */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          <label className="mt-2 flex cursor-pointer select-none items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar contraseña
          </label>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmar Contraseña
          </label>
          <input
            id="password_confirmation"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className={fieldClass('password_confirmation')}
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Botón */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-blue-600 text-base font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creando cuenta…' : 'Crear Cuenta'}
          </button>
        </div>

        {/* Link a login */}
        <p className="pt-2 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Iniciar sesión
          </Link>
        </p>

      </form>
    </AuthCard>
  )
}
