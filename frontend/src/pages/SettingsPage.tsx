import { useState } from 'react'
import { Bell, Globe, Lock, Mail, Shield, Trash2, User } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'

function userInitials(name: string | undefined) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function SectionCard({ title, description, icon: Icon, children }: {
  title: string
  description: string
  icon: typeof User
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Icon className="h-5 w-5 text-blue-600" strokeWidth={1.7} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-blue-600' : 'bg-gray-200',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()

  const [name,  setName]  = useState(user?.name  ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const role = user?.roles?.[0]?.name ?? 'Usuario'

  const [notifEmail,   setNotifEmail]   = useState(true)
  const [notifPush,    setNotifPush]    = useState(false)
  const [notifWeekly,  setNotifWeekly]  = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(true)

  const [language, setLanguage] = useState('es')
  const [timezone, setTimezone] = useState('America/Mexico_City')

  const [profileSaved, setProfileSaved] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // No-op: backend endpoint not yet implemented
    }
  }

  return (
    <DashboardLayout>
      <main className="p-8">
        <div className="mx-auto max-w-3xl space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="mt-2 text-base text-gray-500">Gestiona tu perfil y preferencias</p>
          </div>

          {/* Información del Perfil */}
          <SectionCard title="Información del Perfil" description="Actualiza tu información personal" icon={User}>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
                  {userInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name ?? 'Usuario'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="mt-1 inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">{role}</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Rol</label>
                  <input
                    type="text"
                    value={role}
                    readOnly
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              {profileSaved && (
                <p className="text-sm font-medium text-green-600">Cambios guardados correctamente.</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => { setName(user?.name ?? ''); setEmail(user?.email ?? '') }}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Seguridad */}
          <SectionCard title="Seguridad" description="Administra tu contraseña y acceso" icon={Lock}>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-400" strokeWidth={1.7} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contraseña</p>
                    <p className="text-xs text-gray-400">Última vez cambiada hace 30 días</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cambiar
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.7} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Autenticación de Dos Factores</p>
                    <p className="text-xs text-gray-400">Añade una capa extra de seguridad</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Activar
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Notificaciones */}
          <SectionCard title="Notificaciones" description="Controla qué notificaciones recibes" icon={Bell}>
            <ul className="divide-y divide-gray-100">
              {[
                { label: 'Notificaciones por Correo', desc: 'Recibe alertas importantes en tu email', value: notifEmail, onChange: setNotifEmail },
                { label: 'Notificaciones Push',        desc: 'Notificaciones en tiempo real en el navegador', value: notifPush, onChange: setNotifPush },
                { label: 'Reporte Semanal',            desc: 'Resumen semanal de actividad de tus mapas', value: notifWeekly, onChange: setNotifWeekly },
                { label: 'Actualizaciones de Mapas',   desc: 'Notificaciones cuando alguien ve tus mapas', value: notifUpdates, onChange: setNotifUpdates },
              ].map(({ label, desc, value, onChange }) => (
                <li key={label} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <Toggle checked={value} onChange={onChange} />
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Preferencias */}
          <SectionCard title="Preferencias" description="Personaliza tu experiencia en la plataforma" icon={Globe}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Mail className="mr-1.5 inline h-4 w-4 text-gray-400" strokeWidth={1.7} />
                  Idioma
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Globe className="mr-1.5 inline h-4 w-4 text-gray-400" strokeWidth={1.7} />
                  Zona Horaria
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Zona de Peligro */}
          <section className="rounded-lg border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-600" strokeWidth={1.7} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Zona de Peligro</h2>
                  <p className="text-sm text-gray-500">Acciones irreversibles sobre tu cuenta</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Eliminar cuenta</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Una vez eliminada, todos tus mapas y datos serán borrados permanentemente.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </DashboardLayout>
  )
}
