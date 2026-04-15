export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  roles?: { name: string }[]
}

export interface Building {
  id: number
  user_id: number
  name: string
  description: string | null
  type: 'school' | 'commercial' | 'office' | 'dependency'
  latitude: number | null
  longitude: number | null
  floor_plan_image: string | null
  public_token: string
  public_url: string
  spaces_count?: number
  created_at: string
  updated_at: string
  spaces?: Space[]
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface PaginatedLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface Space {
  id: number
  building_id: number
  name: string
  type: string
  description: string | null
  polygon_data: PolygonPoint[] | null
  color: string
  created_at: string
  updated_at: string
  schedules?: Schedule[]
}

export interface PolygonPoint {
  x: number
  y: number
}

export interface Schedule {
  id: number
  space_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
