import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../types'

vi.mock('../contexts/AuthContext')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const mockUseAuth = vi.mocked(useAuth)

const mockUser: User = {
  id: 1,
  name: 'Emiliano',
  email: 'emiliano@test.com',
  email_verified_at: null,
  created_at: '',
  updated_at: '',
  roles: [{ name: 'user' }],
}

const defaultAuth = {
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...defaultAuth, logout: vi.fn() })
  })

  it('renderiza el título Dashboard', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('muestra mensaje de bienvenida con el nombre del usuario', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/Bienvenido de nuevo, Emiliano/i)).toBeInTheDocument()
  })

  it('renderiza la marca MapBuilder en el sidebar', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('MapBuilder')).toBeInTheDocument()
  })

  it('renderiza el nombre del usuario en el header', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('Emiliano')).toBeInTheDocument()
  })

  it('muestra el botón de cerrar sesión al abrir el menú de usuario', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Emiliano'))
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
  })

  it('llama a logout al hacer clic en cerrar sesión', () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({ ...defaultAuth, logout: mockLogout })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Emiliano'))
    fireEvent.click(screen.getByText('Cerrar sesión'))
    expect(mockLogout).toHaveBeenCalled()
  })
})
