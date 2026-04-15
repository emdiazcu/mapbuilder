import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'
import type { User } from '../../types'

vi.mock('../../contexts/AuthContext')

const mockUseAuth = vi.mocked(useAuth)

const mockUser: User = {
  id: 1,
  name: 'Emiliano',
  email: 'emiliano@test.com',
  email_verified_at: null,
  created_at: '',
  updated_at: '',
}

describe('ProtectedRoute', () => {
  it('muestra spinner de carga mientras isLoading es true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><div>contenido</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('no muestra el contenido mientras carga', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>contenido protegido</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument()
  })

  it('renderiza los children cuando el usuario está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>contenido protegido</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it('no muestra contenido cuando el usuario no está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute><div>contenido protegido</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument()
  })
})
