import api from './axios'
import type { Building, PaginatedMeta, PaginatedLinks } from '../types'

export interface BuildingsResponse {
  data: Building[]
  meta: PaginatedMeta
  links: PaginatedLinks
}

export interface BuildingsParams {
  page?: number
  per_page?: number
  search?: string
  type?: string
}

export interface StoreBuildingData {
  name: string
  type: string
  description?: string
  latitude?: number | null
  longitude?: number | null
  floor_plan_image?: File | null
}

export const buildingsApi = {
  list: (params: BuildingsParams = {}) =>
    api.get<BuildingsResponse>('/buildings', { params }).then((r) => r.data),

  show: (id: number) =>
    api.get<Building>(`/buildings/${id}`).then((r) => r.data),

  store: (data: StoreBuildingData) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) form.append(k, v as string | Blob)
    })
    return api.post<Building>('/buildings', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  update: (id: number, data: Partial<StoreBuildingData>) =>
    api.put<Building>(`/buildings/${id}`, data).then((r) => r.data),

  destroy: (id: number) =>
    api.delete(`/buildings/${id}`).then((r) => r.data),

  toggleFavorite: (id: number) =>
    api.post<Building>(`/buildings/${id}/favorite`).then((r) => r.data),

  showPublic: (token: string) =>
    api.get<Building>(`/maps/${token}/public`).then((r) => r.data),

  exportUrl: (id: number) => `/api/buildings/${id}/export`,
  qrUrl:     (id: number) => `/api/buildings/${id}/qr`,
}
