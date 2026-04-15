import api from './axios'
import type { User } from '../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials).then((r) => r.data),

  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<User>('/auth/me').then((r) => r.data),
}
