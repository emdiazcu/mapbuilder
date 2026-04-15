import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { useAuth } from '../contexts/AuthContext'

vi.mock('../contexts/AuthContext')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const mockUseAuth = vi.mocked(useAuth)

const defaultAuth = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...defaultAuth, login: vi.fn() })
  })

  it('renderiza el campo de correo electrónico', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
  })

  it('renderiza el campo de contraseña', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument()
  })

  it('renderiza el botón de iniciar sesión', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
  })

  it('renderiza el enlace a la página de registro', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByText(/Regístrate aquí/i)).toBeInTheDocument()
  })

  it('llama a login con email y contraseña al enviar el formulario', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({ ...defaultAuth, login: mockLogin })

    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      })
    })
  })

  it('muestra mensaje de error cuando el login falla', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { message: 'Credenciales incorrectas.' } },
    })
    mockUseAuth.mockReturnValue({ ...defaultAuth, login: mockLogin })

    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas.')).toBeInTheDocument()
    })
  })
})
