import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
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

describe('RegisterPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...defaultAuth, register: vi.fn() })
  })

  it('renderiza el campo de nombre completo', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument()
  })

  it('renderiza el campo de correo electrónico', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
  })

  it('renderiza el botón de crear cuenta', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeInTheDocument()
  })

  it('renderiza el enlace a la página de login', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument()
  })

  it('muestra error cuando las contraseñas no coinciden', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)

    const passwordFields = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwordFields[0], { target: { value: 'password123' } })
    fireEvent.change(passwordFields[1], { target: { value: 'diferente' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    })
  })

  it('llama a register con los datos correctos al enviar el formulario', async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue({ ...defaultAuth, register: mockRegister })

    render(<MemoryRouter><RegisterPage /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: 'Emiliano Díaz' },
    })
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'emiliano@test.com' },
    })
    const passwordFields = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwordFields[0], { target: { value: 'password123' } })
    fireEvent.change(passwordFields[1], { target: { value: 'password123' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Emiliano Díaz',
        email: 'emiliano@test.com',
        password: 'password123',
        password_confirmation: 'password123',
      })
    })
  })
})
