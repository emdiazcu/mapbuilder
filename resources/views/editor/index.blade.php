<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $building ? 'Editar: ' . $building->name : 'Nuevo Mapa' }} — MapBuilder</title>
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Leaflet --}}
    <link  rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    {{-- Leaflet-Geoman (dibujo) --}}
    <link  rel="stylesheet" href="https://unpkg.com/@geoman-io/leaflet-geoman-free@2.19.3/dist/leaflet-geoman.css"/>
    <script src="https://unpkg.com/@geoman-io/leaflet-geoman-free@2.19.3/dist/leaflet-geoman.js"></script>

    {{-- Alpine.js --}}
    <script src="//unpkg.com/alpinejs" defer></script>

    <style>
        html, body { height: 100%; margin: 0; padding: 0; }
        #map { height: 100%; width: 100%; }
        /* Asegurar que los controles de Leaflet queden por encima del overlay */
        .leaflet-top, .leaflet-bottom { z-index: 900; }
    </style>
</head>
<body class="flex h-screen flex-col bg-white" x-data="mapEditor()">

{{-- ── Top bar ─────────────────────────────────────────────────────── --}}
<header class="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
    <div class="flex items-center gap-3">
        <a href="{{ route('web.maps') }}"
           class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
           title="Volver">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
        </a>
        <div>
            <p class="text-base font-semibold text-gray-900 leading-5" x-text="form.name || 'Nuevo Mapa'"></p>
            <p class="text-xs text-gray-400">Editor de mapas · OpenStreetMap</p>
        </div>
    </div>

    <div class="flex items-center gap-3">
        {{-- Flash success --}}
        @if(session('success'))
            <p class="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700">
                {{ session('success') }}
            </p>
        @endif

        {{-- Contador de formas --}}
        <span class="text-xs text-gray-400" x-text="spaces.length > 0 ? spaces.length + ' forma' + (spaces.length !== 1 ? 's' : '') + ' dibujada' + (spaces.length !== 1 ? 's' : '') : ''"></span>

        {{-- Botón guardar --}}
        <button type="button" @click="submitForm()"
                :disabled="saving"
                class="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            <span x-text="saving ? 'Guardando…' : 'Guardar'"></span>
        </button>
    </div>
</header>

{{-- ── Formulario oculto para submit ─────────────────────────────── --}}
<form id="editor-form" method="POST"
      action="{{ $building ? route('web.editor.update', $building) : route('web.editor.store') }}">
    @csrf
    @if($building)
        @method('PUT')
    @endif
    <input type="hidden" name="name"        x-bind:value="form.name">
    <input type="hidden" name="type"        x-bind:value="form.type">
    <input type="hidden" name="latitude"    x-bind:value="form.latitude">
    <input type="hidden" name="longitude"   x-bind:value="form.longitude">
    <input type="hidden" name="description" x-bind:value="form.description">
    <input type="hidden" name="spaces_json" x-bind:value="spacesJson">
</form>

{{-- ── Editor body ─────────────────────────────────────────────────── --}}
<div class="flex min-h-0 flex-1">

    {{-- Left toolbar --}}
    <div class="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-gray-200 bg-white px-2 py-4">

        <button type="button" @click="setTool('select')" :title="'Seleccionar / Mover'"
                :class="tool === 'select' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
            </svg>
        </button>

        <div class="my-1 w-8 border-t border-gray-200"></div>

        <button type="button" @click="setTool('polygon')" title="Dibujar polígono"
                :class="tool === 'polygon' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M12 2l9 7-3.5 10h-11L3 9l9-7z"/>
            </svg>
        </button>

        <button type="button" @click="setTool('rectangle')" title="Dibujar rectángulo"
                :class="tool === 'rectangle' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M4 5h16v14H4z"/>
            </svg>
        </button>

        <button type="button" @click="setTool('polyline')" title="Dibujar línea / polilínea"
                :class="tool === 'polyline' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M5 19l7-7 4 4 4-8"/>
            </svg>
        </button>

        <button type="button" @click="setTool('marker')" title="Colocar marcador"
                :class="tool === 'marker' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
        </button>

        {{-- Botón Finalizar: visible solo mientras se dibuja --}}
        <button type="button"
                x-show="['polygon','rectangle','polyline'].includes(tool)"
                x-transition
                @click="finishDrawing()"
                title="Finalizar figura (Enter)"
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm hover:bg-green-700">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"/>
            </svg>
        </button>

        <div class="my-1 w-8 border-t border-gray-200"></div>

        <button type="button" @click="setTool('edit')" title="Editar formas"
                :class="tool === 'edit' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
        </button>

        <button type="button" @click="setTool('delete')" title="Eliminar forma"
                :class="tool === 'delete' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
                class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
        </button>
    </div>

    {{-- Map canvas --}}
    <div class="relative flex-1 overflow-hidden">
        <div id="map"></div>

        {{-- Tool hint --}}
        <div x-show="toolHint"
             class="pointer-events-none absolute bottom-8 left-1/2 z-[1000] -translate-x-1/2">
            <div class="rounded-lg bg-gray-900/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm"
                 x-text="toolHint"></div>
        </div>
    </div>

    {{-- Right panel — Propiedades --}}
    <aside class="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">

        <div class="border-b border-gray-200 px-5 py-4">
            <h2 class="text-base font-semibold text-gray-900">Propiedades del Edificio</h2>
        </div>

        <div class="flex flex-1 flex-col gap-5 px-5 py-5">

            {{-- Nombre --}}
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Nombre del Edificio</label>
                <input type="text" x-model="form.name" placeholder="Ej. Edificio Principal"
                       class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
            </div>

            {{-- Tipo --}}
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Tipo de Edificio</label>
                <select x-model="form.type"
                        class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-blue-500">
                    <option value="">Seleccionar tipo</option>
                    <option value="school">Escuela</option>
                    <option value="commercial">Comercial</option>
                    <option value="office">Oficina</option>
                    <option value="dependency">Dependencia</option>
                </select>
            </div>

            {{-- Lat / Lng --}}
            <div class="flex gap-3">
                <div class="flex flex-1 flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700">Latitud</label>
                    <input type="text" x-model="form.latitude" placeholder="19.4326"
                           class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                </div>
                <div class="flex flex-1 flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700">Longitud</label>
                    <input type="text" x-model="form.longitude" placeholder="-99.1332"
                           class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                </div>
            </div>

            {{-- Descripción --}}
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Descripción</label>
                <textarea rows="3" x-model="form.description" placeholder="Descripción del edificio..."
                          class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"></textarea>
            </div>

            <div class="border-t border-gray-200"></div>

            {{-- Horarios --}}
            <div class="flex flex-col gap-3">
                <h3 class="text-sm font-semibold text-gray-900">Horarios</h3>

                <template x-for="sched in schedules" :key="sched.day">
                    <div class="flex flex-col gap-2">
                        <button type="button" @click="sched.active = !sched.active"
                                :class="sched.active ? 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-400'"
                                class="flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors">
                            <span x-text="sched.label"></span>
                            <span class="text-xs font-normal" x-text="sched.active ? 'Activo' : 'Inactivo'"></span>
                        </button>
                        <template x-if="sched.active">
                            <div class="flex gap-2">
                                <input type="time" x-model="sched.start"
                                       class="h-9 flex-1 rounded-lg border border-gray-300 px-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                                <input type="time" x-model="sched.end"
                                       class="h-9 flex-1 rounded-lg border border-gray-300 px-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>

        {{-- Save button --}}
        <div class="border-t border-gray-200 px-5 py-4">
            <button type="button" @click="submitForm()" :disabled="saving"
                    class="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
                <template x-if="saving">
                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                </template>
                <span x-text="saving ? 'Guardando…' : 'Guardar Edificio'"></span>
            </button>
        </div>
    </aside>
</div>

<script>
function mapEditor() {
    return {
        tool: 'select',
        saving: false,
        spaces: [],
        map: null,

        form: {
            name:        '{{ $building?->name ?? '' }}',
            type:        '{{ $building?->type ?? '' }}',
            latitude:    '{{ $building?->latitude ?? '' }}',
            longitude:   '{{ $building?->longitude ?? '' }}',
            description: '{{ $building?->description ?? '' }}',
        },

        schedules: [
            { day: 1, label: 'Lunes',     active: true,  start: '09:00', end: '18:00' },
            { day: 2, label: 'Martes',    active: true,  start: '09:00', end: '18:00' },
            { day: 3, label: 'Miércoles', active: true,  start: '09:00', end: '18:00' },
            { day: 4, label: 'Jueves',    active: true,  start: '09:00', end: '18:00' },
            { day: 5, label: 'Viernes',   active: true,  start: '09:00', end: '18:00' },
            { day: 6, label: 'Sábado',    active: false, start: '09:00', end: '14:00' },
            { day: 0, label: 'Domingo',   active: false, start: '09:00', end: '14:00' },
        ],

        get toolHint() {
            const hints = {
                polygon:   'Haz clic para añadir puntos · presiona ✓ para cerrar el polígono',
                rectangle: 'Haz clic y arrastra para dibujar un rectángulo',
                polyline:  'Haz clic para añadir puntos · presiona ✓ para terminar la línea',
                marker:    'Haz clic en el mapa para colocar un marcador',
                edit:      'Arrastra los puntos para editar las formas',
                delete:    'Haz clic en una forma para eliminarla',
            }
            return hints[this.tool] || ''
        },

        get spacesJson() {
            return JSON.stringify(this.spaces.map(s => ({
                name:    s.name,
                type:    s.type,
                color:   s.color,
                latlngs: s.latlngs.map(ll => ({ x: ll[0], y: ll[1] })),
            })))
        },

        init() {
            this.$nextTick(() => this.initMap())
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.finishDrawing()
            })
        },

        initMap() {
            const lat = parseFloat(this.form.latitude)  || 19.4326
            const lng = parseFloat(this.form.longitude) || -99.1332

            this.map = L.map('map').setView([lat, lng], 17)
            this.map.doubleClickZoom.disable()

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 22,
            }).addTo(this.map)

            // Inicializar Geoman
            this.map.pm.setGlobalOptions({ snappable: true, continueDrawing: false })

            // Escuchar creación de formas
            this.map.on('pm:create', ({ layer }) => {
                const id     = crypto.randomUUID()
                const latlngs = this.extractLatLngs(layer)
                const type   = this.detectType(layer)

                this.spaces.push({ id, name: type + ' ' + this.spaces.length, type, color: '#2563eb', latlngs, layer })

                // Autocompletar lat/lng si está vacío
                if (!this.form.latitude && !this.form.longitude && latlngs[0]) {
                    this.form.latitude  = latlngs[0][0].toFixed(6)
                    this.form.longitude = latlngs[0][1].toFixed(6)
                }

                layer.on('pm:edit', () => {
                    const space = this.spaces.find(s => s.id === id)
                    if (space) space.latlngs = this.extractLatLngs(layer)
                })

                layer.on('pm:remove', () => {
                    this.spaces = this.spaces.filter(s => s.id !== id)
                })

                this.setTool('select')
            })

            // Cargar espacios existentes si es edición
            @if($building && $spaces->count())
            const existingSpaces = @json($spacesData)

            const allPositions = []
            existingSpaces.forEach(space => {
                if (!space.polygon_data || space.polygon_data.length === 0) return
                const positions = space.polygon_data.map(p => Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y])
                const layer = positions.length === 1
                    ? L.marker(positions[0]).addTo(this.map)
                    : positions.length >= 3
                        ? L.polygon(positions, { color: space.color || '#2563eb', fillOpacity: 0.2 }).addTo(this.map)
                        : L.polyline(positions, { color: space.color || '#2563eb', weight: 3 }).addTo(this.map)

                layer.pm.enable()

                const id = space.id
                this.spaces.push({ id, name: space.name, type: space.type, color: space.color, latlngs: positions, layer })
                allPositions.push(...positions)

                layer.on('pm:edit', () => {
                    const s = this.spaces.find(s => s.id === id)
                    if (s) s.latlngs = this.extractLatLngs(layer)
                })
                layer.on('pm:remove', () => {
                    this.spaces = this.spaces.filter(s => s.id !== id)
                })
            })
            if (allPositions.length > 0) {
                this.map.fitBounds(L.latLngBounds(allPositions), { padding: [40, 40], maxZoom: 19 })
            }
            @endif
        },

        setTool(t) {
            this.tool = t
            this.map.pm.disableDraw()
            this.map.pm.disableGlobalEditMode()
            this.map.pm.disableGlobalRemovalMode()

            if (t === 'polygon')   this.map.pm.enableDraw('Polygon',   { snappable: true, continueDrawing: false })
            if (t === 'rectangle') this.map.pm.enableDraw('Rectangle', { snappable: true, continueDrawing: false })
            if (t === 'polyline')  this.map.pm.enableDraw('Line',      { snappable: true, continueDrawing: false })
            if (t === 'marker')    this.map.pm.enableDraw('Marker',    { continueDrawing: false })
            if (t === 'edit')      this.map.pm.enableGlobalEditMode()
            if (t === 'delete')    this.map.pm.enableGlobalRemovalMode()
        },

        extractLatLngs(layer) {
            if (layer instanceof L.Marker) {
                const ll = layer.getLatLng()
                return [[ll.lat, ll.lng]]
            }
            const lls = layer.getLatLngs()
            const flat = Array.isArray(lls[0]) ? lls[0] : lls
            return flat.map(ll => [ll.lat, ll.lng])
        },

        detectType(layer) {
            if (layer instanceof L.Rectangle) return 'rectangle'
            if (layer instanceof L.Polygon)   return 'polygon'
            if (layer instanceof L.Polyline)  return 'polyline'
            if (layer instanceof L.Marker)    return 'marker'
            return 'shape'
        },

        finishDrawing() {
            const shapeMap = { polygon: 'Polygon', rectangle: 'Rectangle', polyline: 'Line' }
            const shapeName = shapeMap[this.tool]
            if (!shapeName) return

            const drawer = this.map.pm.Draw[shapeName]
            if (!drawer) return

            // _markers holds the placed vertices (excludes the hint/cursor marker)
            const markers   = drawer._markers || []
            const minPoints = this.tool === 'polyline' ? 2 : 3

            if (markers.length < minPoints) {
                this.setTool('select')
                return
            }

            // Capture latlngs BEFORE disableDraw removes the preview layers
            const latlngs = markers.map(m => { const ll = m.getLatLng(); return [ll.lat, ll.lng] })
            const curTool = this.tool

            // Cancel the in-progress drawing (removes preview; does NOT fire pm:create)
            this.map.pm.disableDraw()

            // Build the permanent layer
            const color = '#2563eb'
            const layer = curTool === 'polyline'
                ? L.polyline(latlngs, { color, weight: 3 })
                : L.polygon(latlngs,  { color, fillColor: color, fillOpacity: 0.2 })

            layer.addTo(this.map)
            layer.pm.enable()

            const id   = crypto.randomUUID()
            const type = curTool === 'polyline' ? 'polyline' : 'polygon'
            this.spaces.push({ id, name: type + ' ' + (this.spaces.length + 1), type, color, latlngs, layer })

            if (!this.form.latitude && !this.form.longitude && latlngs[0]) {
                this.form.latitude  = latlngs[0][0].toFixed(6)
                this.form.longitude = latlngs[0][1].toFixed(6)
            }

            layer.on('pm:edit', () => {
                const space = this.spaces.find(s => s.id === id)
                if (space) space.latlngs = this.extractLatLngs(layer)
            })
            layer.on('pm:remove', () => {
                this.spaces = this.spaces.filter(s => s.id !== id)
            })

            this.setTool('select')
        },

        submitForm() {
            if (!this.form.name.trim()) { alert('El nombre del edificio es requerido.'); return }
            if (!this.form.type)        { alert('Selecciona el tipo de edificio.'); return }

            const f = document.getElementById('editor-form')
            f.querySelector('[name="name"]').value        = this.form.name
            f.querySelector('[name="type"]').value        = this.form.type
            f.querySelector('[name="latitude"]').value    = this.form.latitude   || ''
            f.querySelector('[name="longitude"]').value   = this.form.longitude  || ''
            f.querySelector('[name="description"]').value = this.form.description || ''
            f.querySelector('[name="spaces_json"]').value = JSON.stringify(
                this.spaces.map(s => ({
                    name:    s.name,
                    type:    s.type,
                    color:   s.color,
                    latlngs: s.latlngs.map(ll => ({ x: ll[0], y: ll[1] })),
                }))
            )

            this.saving = true
            f.submit()
        },
    }
}
</script>
</body>
</html>
