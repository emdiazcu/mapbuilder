import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import 'leaflet/dist/leaflet.css'
import type { Tool } from './EditorToolbar'
import type { DrawnSpace } from '../../pages/MapEditorPage'
import type { Space } from '../../types'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function randomId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

type GeomanDraw = Record<string, {
  _enabled?: boolean
  enabled?: () => boolean
  _finishShape?: () => void
  _removeLastVertex?: () => void
}>

interface GeomanControllerProps {
  tool: Tool
  initialSpaces: Space[]
  onSpacesLoaded: (loaded: DrawnSpace[]) => void
  onSpaceCreated: (space: DrawnSpace) => void
  onSpaceEdited: (id: string, latlngs: L.LatLng[]) => void
  onSpaceDeleted: (id: string) => void
}

function GeomanController({ tool, initialSpaces, onSpacesLoaded, onSpaceCreated, onSpaceEdited, onSpaceDeleted }: GeomanControllerProps) {
  const map = useMap()
  const layerIds = useRef<Map<L.Layer, string>>(new Map())
  const loadedRef = useRef(false)

  // Keep latest callbacks in refs so effects only depend on `map`
  const createdRef = useRef(onSpaceCreated)
  const editedRef = useRef(onSpaceEdited)
  const deletedRef = useRef(onSpaceDeleted)
  const loadedCbRef = useRef(onSpacesLoaded)
  useEffect(() => { createdRef.current = onSpaceCreated }, [onSpaceCreated])
  useEffect(() => { editedRef.current = onSpaceEdited }, [onSpaceEdited])
  useEffect(() => { deletedRef.current = onSpaceDeleted }, [onSpaceDeleted])
  useEffect(() => { loadedCbRef.current = onSpacesLoaded }, [onSpacesLoaded])

  // Load saved spaces once per map instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loadedRef.current || !initialSpaces.length) return
    loadedRef.current = true
    const loaded: DrawnSpace[] = []
    for (const space of initialSpaces) {
      if (!space.polygon_data?.length) continue
      const latlngs = space.polygon_data.map((p) => L.latLng(p.x, p.y))
      const color = space.color || '#3b82f6'
      let layer: L.Layer
      let type: string
      if (latlngs.length === 1) { layer = L.marker(latlngs[0]); type = 'marker' }
      else if (latlngs.length === 2) { layer = L.polyline(latlngs, { color }); type = 'polyline' }
      else { layer = L.polygon(latlngs, { color, fillColor: color, fillOpacity: 0.2 }); type = 'polygon' }
      const id = String(space.id)
      layerIds.current.set(layer, id)
      map.addLayer(layer)
      ;(layer as L.Path & { pm?: { enable(): void } }).pm?.enable()
      layer.on('pm:edit', () => { const lid = layerIds.current.get(layer); if (lid) editedRef.current(lid, getLatLngs(layer)) })
      layer.on('pm:remove', () => { const lid = layerIds.current.get(layer); if (lid) { deletedRef.current(lid); layerIds.current.delete(layer) } })
      loaded.push({ id, type, latlngs, layer })
    }
    if (loaded.length > 0) {
      loadedCbRef.current(loaded)
      const pts = loaded.flatMap((s) => s.latlngs)
      if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 19 })
    }
  }, [map])

  // Handle pm:create — uses refs so effect only depends on map
  useEffect(() => {
    function onPmCreate({ layer }: { layer: L.Layer }) {
      const id = randomId()
      layerIds.current.set(layer, id)
      createdRef.current({ id, type: getShapeType(layer), latlngs: getLatLngs(layer), layer })
      ;(layer as L.Path & { pm?: { enable(): void } }).pm?.enable()
      layer.on('pm:edit', () => { const lid = layerIds.current.get(layer); if (lid) editedRef.current(lid, getLatLngs(layer)) })
      layer.on('pm:remove', () => { const lid = layerIds.current.get(layer); if (lid) { deletedRef.current(lid); layerIds.current.delete(layer) } })
    }
    map.on('pm:create', onPmCreate)
    return () => { map.off('pm:create', onPmCreate) }
  }, [map])

  // Activate tools — for polygon/polyline: add imperative finish button + click-timing dblclick
  useEffect(() => {
    map.pm.disableDraw()
    map.pm.disableGlobalEditMode()
    map.pm.disableGlobalRemovalMode()
    map.pm.disableGlobalRotateMode()

    if (tool === 'polygon' || tool === 'polyline') {
      const drawType = tool === 'polygon' ? 'Polygon' : 'Line'
      map.pm.enableDraw(drawType, { snappable: true, continueDrawing: false })

      // Finish shape helper
      function finishDraw(removeExtra: boolean) {
        const handler = (map.pm.Draw as unknown as GeomanDraw)[drawType]
        if (handler?.enabled?.() ?? handler?._enabled) {
          if (removeExtra) handler._removeLastVertex?.()
          handler._finishShape?.()
        }
      }

      // Detect double-click via click timing (more reliable than the dblclick event)
      let lastClick = 0
      function onLeafletClick() {
        const now = Date.now()
        if (now - lastClick < 350) finishDraw(true)
        lastClick = now
      }
      map.on('click', onLeafletClick)

      // Imperative finish button (no React state needed — formatter-safe)
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = '✓ Terminar figura'
      btn.style.cssText = [
        'position:fixed', 'bottom:6rem', 'left:50%', 'transform:translateX(-50%)',
        'z-index:9999', 'display:none', 'align-items:center', 'gap:0.5rem',
        'padding:0.625rem 1.25rem', 'background:#16a34a', 'color:#fff',
        'border:none', 'border-radius:0.5rem', 'font-size:0.875rem',
        'font-weight:600', 'cursor:pointer', 'box-shadow:0 4px 12px rgba(0,0,0,.25)',
      ].join(';')
      btn.onmouseenter = () => { btn.style.background = '#15803d' }
      btn.onmouseleave = () => { btn.style.background = '#16a34a' }
      btn.onclick = () => finishDraw(false)
      document.body.appendChild(btn)

      function showBtn() { btn.style.display = 'flex' }
      function hideBtn() { btn.style.display = 'none' }
      map.on('pm:drawstart', showBtn)
      map.on('pm:create', hideBtn)
      map.on('pm:drawend', hideBtn)

      return () => {
        map.off('click', onLeafletClick)
        map.off('pm:drawstart', showBtn)
        map.off('pm:create', hideBtn)
        map.off('pm:drawend', hideBtn)
        document.body.removeChild(btn)
        map.pm.disableDraw()
        map.pm.disableGlobalEditMode()
        map.pm.disableGlobalRemovalMode()
        map.pm.disableGlobalRotateMode()
      }
    }

    switch (tool) {
      case 'rectangle': map.pm.enableDraw('Rectangle', { snappable: true, continueDrawing: false }); break
      case 'marker':    map.pm.enableDraw('Marker',    { continueDrawing: false });                   break
      case 'edit':      map.pm.enableGlobalEditMode();    break
      case 'delete':    map.pm.enableGlobalRemovalMode(); break
      default: break
    }

    return () => {
      map.pm.disableDraw()
      map.pm.disableGlobalEditMode()
      map.pm.disableGlobalRemovalMode()
      map.pm.disableGlobalRotateMode()
    }
  }, [tool, map])

  return null
}

function getLatLngs(layer: L.Layer): L.LatLng[] {
  if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
    const ll = layer.getLatLngs()
    return Array.isArray(ll[0]) ? (ll[0] as L.LatLng[]) : (ll as L.LatLng[])
  }
  if (layer instanceof L.Marker) return [layer.getLatLng()]
  return []
}

function getShapeType(layer: L.Layer): string {
  if (layer instanceof L.Rectangle) return 'rectangle'
  if (layer instanceof L.Polygon)   return 'polygon'
  if (layer instanceof L.Polyline)  return 'polyline'
  if (layer instanceof L.Marker)    return 'marker'
  return 'unknown'
}

interface MapCanvasProps {
  tool: Tool
  center: [number, number]
  initialSpaces?: Space[]
  onSpacesLoaded?: (loaded: DrawnSpace[]) => void
  onSpaceCreated: (space: DrawnSpace) => void
  onSpaceEdited: (id: string, latlngs: L.LatLng[]) => void
  onSpaceDeleted: (id: string) => void
}

export default function MapCanvas({ tool, center, initialSpaces = [], onSpacesLoaded = () => {}, onSpaceCreated, onSpaceEdited, onSpaceDeleted }: MapCanvasProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <MapContainer center={center} zoom={17} className="h-full w-full" style={{ height: '100%', width: '100%' }} zoomControl doubleClickZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={22} />
        <GeomanController tool={tool} initialSpaces={initialSpaces} onSpacesLoaded={onSpacesLoaded} onSpaceCreated={onSpaceCreated} onSpaceEdited={onSpaceEdited} onSpaceDeleted={onSpaceDeleted} />
      </MapContainer>
      <ToolHint tool={tool} />
    </div>
  )
}

function ToolHint({ tool }: { tool: Tool }) {
  const hints: Record<string, string> = {
    polygon:   'Clic para añadir vértices · doble clic o botón verde para cerrar',
    rectangle: 'Clic y arrastra para dibujar un rectángulo',
    polyline:  'Clic para añadir puntos · doble clic o botón verde para terminar',
    marker:    'Clic en el mapa para colocar un marcador',
    edit:      'Arrastra los vértices para editar las formas',
    delete:    'Clic en una forma para eliminarla',
  }
  const hint = hints[tool]
  if (!hint) return null
  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 z-[1000] -translate-x-1/2">
      <div className="rounded-lg bg-gray-900/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm">{hint}</div>
    </div>
  )
}
