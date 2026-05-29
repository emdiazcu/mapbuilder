import {
  Hand,
  MapPin,
  Minus,
  MousePointer2,
  Pentagon,
  Square,
  Trash2,
} from 'lucide-react'

export type Tool = 'select' | 'polygon' | 'rectangle' | 'polyline' | 'marker' | 'edit' | 'delete'

interface EditorToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
}

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}

function ToolButton({ icon, label, active = false, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={[
        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100',
      ].join(' ')}
    >
      {icon}
    </button>
  )
}

function Divider() {
  return <div className="my-1 w-8 border-t border-gray-200" />
}

export default function EditorToolbar({ activeTool, onToolChange }: EditorToolbarProps) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-gray-200 bg-white px-2 py-4">

      <ToolButton
        icon={<MousePointer2 className="h-5 w-5" strokeWidth={1.7} />}
        label="Seleccionar / Mover mapa"
        active={activeTool === 'select'}
        onClick={() => onToolChange('select')}
      />

      <Divider />

      <ToolButton
        icon={<Pentagon className="h-5 w-5" strokeWidth={1.7} />}
        label="Dibujar polígono"
        active={activeTool === 'polygon'}
        onClick={() => onToolChange('polygon')}
      />
      <ToolButton
        icon={<Square className="h-5 w-5" strokeWidth={1.7} />}
        label="Dibujar rectángulo"
        active={activeTool === 'rectangle'}
        onClick={() => onToolChange('rectangle')}
      />
      <ToolButton
        icon={<Minus className="h-5 w-5" strokeWidth={1.7} />}
        label="Dibujar línea / polilínea"
        active={activeTool === 'polyline'}
        onClick={() => onToolChange('polyline')}
      />
      <ToolButton
        icon={<MapPin className="h-5 w-5" strokeWidth={1.7} />}
        label="Colocar marcador"
        active={activeTool === 'marker'}
        onClick={() => onToolChange('marker')}
      />

      <Divider />

      <ToolButton
        icon={<Hand className="h-5 w-5" strokeWidth={1.7} />}
        label="Editar formas"
        active={activeTool === 'edit'}
        onClick={() => onToolChange('edit')}
      />
      <ToolButton
        icon={<Trash2 className="h-5 w-5" strokeWidth={1.7} />}
        label="Eliminar forma"
        active={activeTool === 'delete'}
        onClick={() => onToolChange('delete')}
      />

    </div>
  )
}
