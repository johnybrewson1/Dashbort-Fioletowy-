import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SupabaseDashboard from '../pages/SupabaseDashboard'

// Mock all the components
vi.mock('../components/layout/Header', () => ({
  Header: ({ onCreateClick }: { onCreateClick: () => void }) => (
    <div data-testid="header">
      <button onClick={onCreateClick} data-testid="create-button">Create</button>
    </div>
  )
}))

vi.mock('../components/layout/Sidebar', () => ({
  Sidebar: ({ activeSection, onSectionChange }: { 
    activeSection: string
    onSectionChange: (section: string) => void 
  }) => (
    <div data-testid="sidebar">
      <button 
        onClick={() => onSectionChange('posts')}
        data-testid="posts-nav"
        className={activeSection === 'posts' ? 'active' : ''}
      >
        Posts
      </button>
      <button 
        onClick={() => onSectionChange('scripts')}
        data-testid="scripts-nav"
        className={activeSection === 'scripts' ? 'active' : ''}
      >
        Scripts
      </button>
      <button 
        onClick={() => onSectionChange('captions')}
        data-testid="captions-nav"
        className={activeSection === 'captions' ? 'active' : ''}
      >
        Captions
      </button>
      <button 
        onClick={() => onSectionChange('rankings')}
        data-testid="rankings-nav"
        className={activeSection === 'rankings' ? 'active' : ''}
      >
        Rankings
      </button>
      <button 
        onClick={() => onSectionChange('settings')}
        data-testid="settings-nav"
        className={activeSection === 'settings' ? 'active' : ''}
      >
        Settings
      </button>
    </div>
  )
}))

vi.mock('../components/sections/SupabasePostsSection', () => ({
  SupabasePostsSection: () => <div data-testid="posts-section">Posts Section</div>
}))

vi.mock('../components/sections/SupabaseScriptsSection', () => ({
  SupabaseScriptsSection: () => <div data-testid="scripts-section">Scripts Section</div>
}))

vi.mock('../components/sections/CaptionsSection', () => ({
  CaptionsSection: () => <div data-testid="captions-section">Captions Section</div>
}))

vi.mock('../components/sections/SupabaseRankingsSection', () => ({
  SupabaseRankingsSection: () => <div data-testid="rankings-section">Rankings Section</div>
}))

vi.mock('../components/sections/SupabaseStatsCards', () => ({
  SupabaseStatsCards: () => <div data-testid="stats-cards">Stats Cards</div>
}))

vi.mock('../components/SupabaseSettingsSection', () => ({
  SupabaseSettingsSection: () => <div data-testid="settings-section">Settings Section</div>
}))

vi.mock('../components/modals/CreateModal', () => ({
  CreateModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    ) : null
}))

vi.mock('../components/FloatingBackground', () => ({
  default: () => <div data-testid="floating-background">Floating Background</div>
}))

describe('SupabaseDashboard Component', () => {
  beforeEach(() => {
    // Clear localStorage and reset URL hash
    localStorage.clear()
    window.location.hash = ''
  })

  it('renders without crashing', () => {
    render(<SupabaseDashboard />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('floating-background')).toBeInTheDocument()
  })

  it('renders dashboard section by default', () => {
    render(<SupabaseDashboard />)
    expect(screen.getByText('Supabase Dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('stats-cards')).toBeInTheDocument()
  })

  it('switches to posts section when posts nav is clicked', async () => {
    render(<SupabaseDashboard />)
    
    const postsNav = screen.getByTestId('posts-nav')
    fireEvent.click(postsNav)
    
    await waitFor(() => {
      expect(screen.getByTestId('posts-section')).toBeInTheDocument()
    })
  })

  it('switches to scripts section when scripts nav is clicked', async () => {
    render(<SupabaseDashboard />)
    
    const scriptsNav = screen.getByTestId('scripts-nav')
    fireEvent.click(scriptsNav)
    
    await waitFor(() => {
      expect(screen.getByTestId('scripts-section')).toBeInTheDocument()
    })
  })

  it('switches to captions section when captions nav is clicked', async () => {
    render(<SupabaseDashboard />)
    
    const captionsNav = screen.getByTestId('captions-nav')
    fireEvent.click(captionsNav)
    
    await waitFor(() => {
      expect(screen.getByTestId('captions-section')).toBeInTheDocument()
    })
  })

  it('switches to rankings section when rankings nav is clicked', async () => {
    render(<SupabaseDashboard />)
    
    const rankingsNav = screen.getByTestId('rankings-nav')
    fireEvent.click(rankingsNav)
    
    await waitFor(() => {
      expect(screen.getByTestId('rankings-section')).toBeInTheDocument()
    })
  })

  it('switches to settings section when settings nav is clicked', async () => {
    render(<SupabaseDashboard />)
    
    const settingsNav = screen.getByTestId('settings-nav')
    fireEvent.click(settingsNav)
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-section')).toBeInTheDocument()
    })
  })

  it('opens create modal when create button is clicked', () => {
    render(<SupabaseDashboard />)
    
    const createButton = screen.getByTestId('create-button')
    fireEvent.click(createButton)
    
    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
  })

  it('closes create modal when close button is clicked', () => {
    render(<SupabaseDashboard />)
    
    // Open modal
    const createButton = screen.getByTestId('create-button')
    fireEvent.click(createButton)
    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
    
    // Close modal
    const closeButton = screen.getByTestId('close-modal')
    fireEvent.click(closeButton)
    
    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument()
  })

  it('loads active section from URL hash on mount', () => {
    window.location.hash = '#posts'
    render(<SupabaseDashboard />)
    
    expect(screen.getByTestId('posts-section')).toBeInTheDocument()
  })

  it('loads active section from localStorage when no URL hash', () => {
    localStorage.setItem('activeSection', 'scripts')
    render(<SupabaseDashboard />)
    
    expect(screen.getByTestId('scripts-section')).toBeInTheDocument()
  })

  it('updates URL hash when section changes', async () => {
    render(<SupabaseDashboard />)
    
    const postsNav = screen.getByTestId('posts-nav')
    fireEvent.click(postsNav)
    
    await waitFor(() => {
      expect(window.location.hash).toBe('#posts')
    })
  })

  it('saves section to localStorage when section changes', async () => {
    render(<SupabaseDashboard />)
    
    const postsNav = screen.getByTestId('posts-nav')
    fireEvent.click(postsNav)
    
    await waitFor(() => {
      expect(localStorage.getItem('activeSection')).toBe('posts')
    })
  })
})
