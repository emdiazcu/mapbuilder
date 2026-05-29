import api from './axios'
import type { Space, Schedule } from '../types'

export interface StoreSpaceData {
  name: string
  type: string
  description?: string
  color?: string
  polygon_data?: { x: number; y: number }[]
}

export interface StoreScheduleData {
  day_of_week: number
  start_time: string
  end_time: string
  is_active?: boolean
}

export const spacesApi = {
  list: (buildingId: number) =>
    api.get<{ data: Space[] }>(`/buildings/${buildingId}/spaces`).then((r) => r.data.data),

  store: (buildingId: number, data: StoreSpaceData) =>
    api.post<Space>(`/buildings/${buildingId}/spaces`, data).then((r) => r.data),

  update: (spaceId: number, data: Partial<StoreSpaceData>) =>
    api.put<Space>(`/spaces/${spaceId}`, data).then((r) => r.data),

  destroy: (spaceId: number) =>
    api.delete(`/spaces/${spaceId}`).then((r) => r.data),
}

export const schedulesApi = {
  list: (spaceId: number) =>
    api.get<Schedule[]>(`/spaces/${spaceId}/schedules`).then((r) => r.data),

  store: (spaceId: number, data: StoreScheduleData) =>
    api.post<Schedule>(`/spaces/${spaceId}/schedules`, data).then((r) => r.data),

  update: (scheduleId: number, data: Partial<StoreScheduleData>) =>
    api.put<Schedule>(`/schedules/${scheduleId}`, data).then((r) => r.data),

  destroy: (scheduleId: number) =>
    api.delete(`/schedules/${scheduleId}`).then((r) => r.data),
}
