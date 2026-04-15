import { render, screen } from '@testing-library/react'
import Logo from './Logo'

describe('Logo', () => {
  it('renderiza una imagen', () => {
    render(<Logo />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('usa el tamaño por defecto de 56', () => {
    render(<Logo />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '56')
    expect(img).toHaveAttribute('height', '56')
  })

  it('acepta un tamaño personalizado', () => {
    render(<Logo size={64} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '64')
    expect(img).toHaveAttribute('height', '64')
  })

  it('tiene texto alternativo correcto', () => {
    render(<Logo />)
    expect(screen.getByAltText('MapBuilder logo')).toBeInTheDocument()
  })
})
