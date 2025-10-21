import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MagicButton from '../components/MagicButton'

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}))

describe('MagicButton Component', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct text and icon', () => {
    render(<MagicButton onClick={mockOnClick} />)
    
    expect(screen.getByText('Stwórz')).toBeInTheDocument()
    expect(screen.getByText('✨')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<MagicButton onClick={mockOnClick} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when loading prop is true', () => {
    render(<MagicButton onClick={mockOnClick} loading={true} />)
    
    expect(screen.getByText('Tworzenie...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<MagicButton onClick={mockOnClick} disabled={true} />)
    
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when both loading and disabled are true', () => {
    render(<MagicButton onClick={mockOnClick} loading={true} disabled={true} />)
    
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    render(<MagicButton onClick={mockOnClick} disabled={true} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    render(<MagicButton onClick={mockOnClick} loading={true} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('has correct CSS classes', () => {
    render(<MagicButton onClick={mockOnClick} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('magic-button', 'w-full', 'h-16', 'text-xl', 'font-bold')
  })
})
