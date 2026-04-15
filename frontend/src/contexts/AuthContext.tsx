import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, type LoginCredentials, type RegisterData } from '../api/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaurar sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    authApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const { user, token } = await authApi.login(credentials)
    localStorage.setItem('auth_token', token)
    setUser(user)
  }

  const register = async (data: RegisterData) => {
    const { user, token } = await authApi.register(data)
    localStorage.setItem('auth_token', token)
    setUser(user)
  }

  const logout = async () => {
    await authApi.logout().catch(() => {})
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
