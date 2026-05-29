import type { ReactNode } from 'react'
import Logo from '../ui/Logo'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md flex flex-col gap-8">

        {/* Logo + marca */}
        <div className="flex flex-col items-center">
          <Logo size={64} />
          <h2 className="mt-5 text-2xl font-bold text-gray-900 tracking-tight">
            MapBuilder
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Plataforma SaaS de Mapeo de Edificios
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>

      </div>
    </div>
  )
}
