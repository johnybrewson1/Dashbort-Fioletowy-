import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the components that require authentication
vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>
}))

vi.mock('../pages/SupabaseDashboard', () => ({
  default: () => <div data-testid="supabase-dashboard">Supabase Dashboard</div>
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="legacy-dashboard">Legacy Dashboard</div>
}))

vi.mock('../pages/Auth', () => ({
  default: () => <div data-testid="auth-page">Auth Page</div>
}))

vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found">Not Found</div>
}))

// Mock the QueryClient to avoid issues with React Query
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const renderWithRouter = (component: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(component)
}

describe('App Component', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />)
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
  })

  it('renders Auth component on root route', () => {
    renderWithRouter(<App />, { route: '/' })
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
  })

  it('renders Auth component on /auth route', () => {
    renderWithRouter(<App />, { route: '/auth' })
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
  })

  it('renders SupabaseDashboard on /dashboard route', () => {
    renderWithRouter(<App />, { route: '/dashboard' })
    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('supabase-dashboard')).toBeInTheDocument()
  })

  it('renders Legacy Dashboard on /legacy-dashboard route', () => {
    renderWithRouter(<App />, { route: '/legacy-dashboard' })
    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('legacy-dashboard')).toBeInTheDocument()
  })

  it('renders NotFound component for unknown routes', () => {
    renderWithRouter(<App />, { route: '/unknown-route' })
    expect(screen.getByTestId('not-found')).toBeInTheDocument()
  })
})
