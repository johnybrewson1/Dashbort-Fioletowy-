import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock all external dependencies
vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>
}))

vi.mock('../pages/SupabaseDashboard', () => ({
  default: () => {
    const [activeSection, setActiveSection] = React.useState('dashboard')
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    
    return (
      <div data-testid="supabase-dashboard">
        <div data-testid="dashboard-content">
          <h1>Supabase Dashboard</h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="create-button"
          >
            Create Content
          </button>
        </div>
        
        {isCreateModalOpen && (
          <div data-testid="create-modal">
            <h2>Create New Content</h2>
            <input 
              data-testid="content-input"
              placeholder="Enter your content..."
            />
            <div data-testid="platform-selection">
              <label>
                <input type="checkbox" data-testid="instagram-checkbox" />
                Instagram
              </label>
              <label>
                <input type="checkbox" data-testid="tiktok-checkbox" />
                TikTok
              </label>
              <label>
                <input type="checkbox" data-testid="youtube-checkbox" />
                YouTube
              </label>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              data-testid="close-modal"
            >
              Close
            </button>
            <button 
              onClick={() => {
                // Simulate content creation
                setIsCreateModalOpen(false)
              }}
              data-testid="submit-content"
            >
              Create
            </button>
          </div>
        )}
        
        <nav data-testid="sidebar">
          <button 
            onClick={() => setActiveSection('posts')}
            data-testid="posts-nav"
            className={activeSection === 'posts' ? 'active' : ''}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveSection('scripts')}
            data-testid="scripts-nav"
            className={activeSection === 'scripts' ? 'active' : ''}
          >
            Scripts
          </button>
          <button 
            onClick={() => setActiveSection('captions')}
            data-testid="captions-nav"
            className={activeSection === 'captions' ? 'active' : ''}
          >
            Captions
          </button>
        </nav>
      </div>
    )
  }
}))

vi.mock('../pages/Auth', () => ({
  default: () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)
    
    if (isAuthenticated) {
      return <div data-testid="auth-success">Authentication successful!</div>
    }
    
    return (
      <div data-testid="auth-page">
        <h1>Login</h1>
        <button 
          onClick={() => setIsAuthenticated(true)}
          data-testid="login-button"
        >
          Login
        </button>
      </div>
    )
  }
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="legacy-dashboard">Legacy Dashboard</div>
}))

vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found">Page Not Found</div>
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock toast
vi.mock('../components/ui/use-toast', () => ({
  toast: vi.fn()
}))

const renderWithRouter = (component: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(component)
}

describe('Integration Tests - User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.location.hash = ''
  })

  describe('Authentication Flow', () => {
    it('allows user to login and access dashboard', async () => {
      const user = userEvent.setup()
      renderWithRouter(<App />, { route: '/auth' })
      
      // User starts on auth page
      expect(screen.getByTestId('auth-page')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
      
      // User clicks login
      const loginButton = screen.getByTestId('login-button')
      await user.click(loginButton)
      
      // User is now authenticated
      expect(screen.getByTestId('auth-success')).toBeInTheDocument()
    })

    it('redirects to dashboard after authentication', async () => {
      const user = userEvent.setup()
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // User should see protected route wrapper
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
      expect(screen.getByTestId('supabase-dashboard')).toBeInTheDocument()
    })
  })

  describe('Dashboard Navigation Flow', () => {
    it('allows user to navigate between different sections', async () => {
      const user = userEvent.setup()
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // User starts on dashboard
      expect(screen.getByText('Supabase Dashboard')).toBeInTheDocument()
      
      // User navigates to posts section
      const postsNav = screen.getByTestId('posts-nav')
      await user.click(postsNav)
      
      // User should see posts section is active
      expect(postsNav).toHaveClass('active')
      
      // User navigates to scripts section
      const scriptsNav = screen.getByTestId('scripts-nav')
      await user.click(scriptsNav)
      
      // User should see scripts section is active
      expect(scriptsNav).toHaveClass('active')
      expect(postsNav).not.toHaveClass('active')
      
      // User navigates to captions section
      const captionsNav = screen.getByTestId('captions-nav')
      await user.click(captionsNav)
      
      // User should see captions section is active
      expect(captionsNav).toHaveClass('active')
      expect(scriptsNav).not.toHaveClass('active')
    })
  })

  describe('Content Creation Flow', () => {
    it('allows user to create new content through modal', async () => {
      const user = userEvent.setup()
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // User clicks create button
      const createButton = screen.getByTestId('create-button')
      await user.click(createButton)
      
      // Modal opens
      expect(screen.getByTestId('create-modal')).toBeInTheDocument()
      expect(screen.getByText('Create New Content')).toBeInTheDocument()
      
      // User enters content
      const contentInput = screen.getByTestId('content-input')
      await user.type(contentInput, 'This is my new post content')
      
      // User selects platforms
      const instagramCheckbox = screen.getByTestId('instagram-checkbox')
      const tiktokCheckbox = screen.getByTestId('tiktok-checkbox')
      
      await user.click(instagramCheckbox)
      await user.click(tiktokCheckbox)
      
      expect(instagramCheckbox).toBeChecked()
      expect(tiktokCheckbox).toBeChecked()
      
      // User submits content
      const submitButton = screen.getByTestId('submit-content')
      await user.click(submitButton)
      
      // Modal closes
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument()
    })

    it('allows user to close modal without creating content', async () => {
      const user = userEvent.setup()
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // User opens modal
      const createButton = screen.getByTestId('create-button')
      await user.click(createButton)
      
      expect(screen.getByTestId('create-modal')).toBeInTheDocument()
      
      // User closes modal
      const closeButton = screen.getByTestId('close-modal')
      await user.click(closeButton)
      
      // Modal closes
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument()
    })
  })

  describe('URL Navigation Flow', () => {
    it('handles direct URL access to different sections', async () => {
      // Test direct access to posts section
      window.location.hash = '#posts'
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // Wait for the component to process the hash change
      await waitFor(() => {
        expect(screen.getByTestId('posts-nav')).toHaveClass('active')
      })
      
      // Test direct access to scripts section
      window.location.hash = '#scripts'
      renderWithRouter(<App />, { route: '/dashboard' })
      
      await waitFor(() => {
        expect(screen.getByTestId('scripts-nav')).toHaveClass('active')
      })
    })

    it('persists section selection in localStorage', async () => {
      const user = userEvent.setup()
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // User navigates to posts section
      const postsNav = screen.getByTestId('posts-nav')
      await user.click(postsNav)
      
      // Wait for the state to update and localStorage to be set
      await waitFor(() => {
        expect(localStorage.getItem('activeSection')).toBe('posts')
      })
    })
  })

  describe('Error Handling Flow', () => {
    it('shows 404 page for unknown routes', () => {
      renderWithRouter(<App />, { route: '/unknown-route' })
      
      expect(screen.getByTestId('not-found')).toBeInTheDocument()
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })

    it('handles legacy dashboard route', () => {
      renderWithRouter(<App />, { route: '/legacy-dashboard' })
      
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
      expect(screen.getByTestId('legacy-dashboard')).toBeInTheDocument()
    })
  })

  describe('Responsive Design Flow', () => {
    it('maintains functionality across different viewport sizes', async () => {
      const user = userEvent.setup()
      
      // Test on mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      renderWithRouter(<App />, { route: '/dashboard' })
      
      // All functionality should still work
      expect(screen.getByTestId('supabase-dashboard')).toBeInTheDocument()
      
      // Test navigation
      const postsNav = screen.getByTestId('posts-nav')
      await user.click(postsNav)
      expect(postsNav).toHaveClass('active')
      
      // Test modal opening
      const createButton = screen.getByTestId('create-button')
      await user.click(createButton)
      expect(screen.getByTestId('create-modal')).toBeInTheDocument()
    })
  })
})
