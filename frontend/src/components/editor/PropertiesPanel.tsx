import { type ChangeEvent } from 'react'

const DAYS = [
  { key: 1, label: 'Lun' },
  { key: 2, label: 'Mar' },
  { key: 3, label: 'Mié' },
  { key: 4, label: 'Jue' },
  { key: 5, label: 'Vie' },
  { key: 6, label: 'Sáb' },
  { key: 0, label: 'Dom' },
]

export interface ScheduleEntry {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface BuildingFormData {
  name: string
  type: string
  latitude: string
  longitude: string
  description: string
}

interface PropertiesPanelProps {
  form: BuildingFormData
  onFormChange: (f: BuildingFormData) => void
  schedules: ScheduleEntry[]
  onScheduleChange: (schedules: ScheduleEntry[]) => void
  onSave: () => void
  saving: boolean
}

export default function PropertiesPanel({
  form,
  onFormChange,
  schedules,
  onScheduleChange,
  onSave,
  saving,
}: PropertiesPanelProps) {
  const set = (key: keyof BuildingFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onFormChange({ ...form, [key]: e.target.value })

  const toggleDay = (day: number) => {
    onScheduleChange(
      schedules.map((s) =>
        s.day_of_week === day ? { ...s, is_active: !s.is_active } : s,
      ),
    )
  }

  const setTime =
    (day: number, field: 'start_time' | 'end_time') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      onScheduleChange(
        schedules.map((s) =>
          s.day_of_week === day ? { ...s, [field]: e.target.value } : s,
        ),
      )
    }

  const inputClass =
    'h-10 w-full rounded-lg border border-[#D1D5DC] px-3 text-sm text-[#101828] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 placeholder:text-[#9CA3AF]'

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-[#E5E7EB] bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-base font-semibold text-[#101828]">Propiedades del Edificio</h2>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-5 py-5">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#364153]">Nombre del Edificio</label>
          <input
            type="text"
            placeholder="Ej. Edificio Principal"
            value={form.name}
            onChange={set('name')}
            className={inputClass}
          />
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#364153]">Tipo de Edificio</label>
          <select
            value={form.type}
            onChange={set('type')}
            className={inputClass}
          >
            <option value="">Seleccionar tipo</option>
            <option value="school">Escuela</option>
            <option value="commercial">Comercial</option>
            <option value="office">Oficina</option>
            <option value="dependency">Dependencia</option>
          </select>
        </div>

        {/* Lat / Lng */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-[#364153]">Latitud</label>
            <input
              type="text"
              placeholder="19.4326"
              value={form.latitude}
              onChange={set('latitude')}
              className={inputClass}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-[#364153]">Longitud</label>
            <input
              type="text"
              placeholder="-99.1332"
              value={form.longitude}
              onChange={set('longitude')}
              className={inputClass}
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#364153]">Descripción</label>
          <textarea
            rows={3}
            placeholder="Descripción del edificio..."
            value={form.description}
            onChange={set('description')}
            className="w-full resize-none rounded-lg border border-[#D1D5DC] px-3 py-2 text-sm text-[#101828] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Separador */}
        <div className="border-t border-[#E5E7EB]" />

        {/* Horarios */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[#101828]">Horarios</h3>

          {DAYS.map(({ key, label }) => {
            const sched = schedules.find((s) => s.day_of_week === key)
            if (!sched) return null
            const active = sched.is_active

            return (
              <div key={key} className="flex flex-col gap-2">
                {/* Day toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(key)}
                  className={[
                    'flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#EFF6FF] text-[#2563EB] ring-1 ring-inset ring-[#BFDBFE]'
                      : 'bg-[#F3F4F6] text-[#9CA3AF]',
                  ].join(' ')}
                >
                  <span>{label}</span>
                  <span className="text-xs font-normal">{active ? 'Activo' : 'Inactivo'}</span>
                </button>

                {/* Time inputs — only when active */}
                {active && (
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={sched.start_time}
                      onChange={setTime(key, 'start_time')}
                      className="h-9 flex-1 rounded-lg border border-[#D1D5DC] px-2 text-sm text-[#101828] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                    <input
                      type="time"
                      value={sched.end_time}
                      onChange={setTime(key, 'end_time')}
                      className="h-9 flex-1 rounded-lg border border-[#D1D5DC] px-2 text-sm text-[#101828] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="border-t border-[#E5E7EB] px-5 py-4">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando…
            </>
          ) : (
            'Guardar Edificio'
          )}
        </button>
      </div>
    </aside>
  )
}
