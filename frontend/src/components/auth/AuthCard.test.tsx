import { render, screen } from '@testing-library/react'
import AuthCard from './AuthCard'

vi.mock('../ui/Logo', () => ({
  default: ({ size }: { size?: number }) => <img src="/logo.png" alt="MapBuilder logo" width={size} />,
}))

describe('AuthCard', () => {
  it('renderiza el nombre de la marca MapBuilder', () => {
    render(<AuthCard title="Test" subtitle="Subtítulo"><div /></AuthCard>)
    expect(screen.getByText('MapBuilder')).toBeInTheDocument()
  })

  it('renderiza el subtítulo de la plataforma', () => {
    render(<AuthCard title="Test" subtitle="Subtítulo"><div /></AuthCard>)
    expect(screen.getByText('Plataforma SaaS de Mapeo de Edificios')).toBeInTheDocument()
  })

  it('renderiza el título recibido por props', () => {
    render(<AuthCard title="Iniciar Sesión" subtitle="Subtítulo"><div /></AuthCard>)
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('renderiza el subtítulo recibido por props', () => {
    render(<AuthCard title="Test" subtitle="Ingresa a tu cuenta"><div /></AuthCard>)
    expect(screen.getByText('Ingresa a tu cuenta')).toBeInTheDocument()
  })

  it('renderiza los children correctamente', () => {
    render(
      <AuthCard title="Test" subtitle="Test">
        <span data-testid="child-content">contenido hijo</span>
      </AuthCard>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renderiza el logo con el tamaño correcto', () => {
    render(<AuthCard title="Test" subtitle="Test"><div /></AuthCard>)
    const logo = screen.getByAltText('MapBuilder logo')
    expect(logo).toHaveAttribute('width', '64')
  })
})
