import type { ReactNode } from 'react'
import Logo from '../ui/Logo'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, white 50%, #EFF6FF 100%)' }}
    >
      <div className="w-full max-w-[448px] flex flex-col gap-8">

        {/* Logo + marca — fuera del card */}
        <div className="flex flex-col items-center">
          <Logo size={64} />
          <h2 className="mt-5 text-2xl font-bold text-[#101828] tracking-tight">
            MapBuilder
          </h2>
          <p className="text-sm text-[#6A7282] mt-1">
            Plataforma SaaS de Mapeo de Edificios
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-[#E5E7EB]" style={{ padding: '32px' }}>
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
            <p className="text-sm text-[#6A7282] mt-1">{subtitle}</p>
          </div>
          {children}
        </div>

      </div>
    </div>
  )
}
