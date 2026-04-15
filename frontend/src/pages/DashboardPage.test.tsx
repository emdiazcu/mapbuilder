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
vi.mock('../components/ui/Logo', () => ({
  default: () => <img src="/logo.png" alt="MapBuilder logo" />,
}))

const mockUseAuth = vi.mocked(useAuth)

const mockUser: User = {
  id: 1,
  name: 'Emiliano',
  email: 'emiliano@test.com',
  email_verified_at: null,
  created_at: '',
  updated_at: '',
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

  it('renderiza el nombre del usuario autenticado', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('Emiliano')).toBeInTheDocument()
  })

  it('renderiza la marca MapBuilder en la barra de navegación', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('MapBuilder')).toBeInTheDocument()
  })

  it('renderiza el botón de cerrar sesión', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeInTheDocument()
  })

  it('renderiza el título de Mis Edificios', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('Mis Edificios')).toBeInTheDocument()
  })

  it('muestra mensaje de bienvenida con el nombre del usuario', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/Bienvenido, Emiliano/i)).toBeInTheDocument()
  })

  it('llama a logout al hacer clic en cerrar sesión', () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({ ...defaultAuth, logout: mockLogout })

    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }))

    expect(mockLogout).toHaveBeenCalled()
  })
})
