import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSupabasePosts, useSupabaseScripts, useSupabaseRankings, useSupabaseCaptions, useSupabaseStats } from '../hooks/useSupabaseData'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn()
  }
}

vi.mock('../integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}))

// Mock services
vi.mock('../lib/supabase', () => ({
  postsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  scriptsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  rankingsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  captionsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  analyticsService: {
    logEvent: vi.fn(),
    getUserStats: vi.fn()
  }
}))

describe('useSupabasePosts Hook', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  })

  it('loads posts on mount', async () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', content: 'Content 1', platform: 'instagram' },
      { id: '2', title: 'Post 2', content: 'Content 2', platform: 'tiktok' }
    ]
    
    const { postsService } = await import('../lib/supabase')
    vi.mocked(postsService.getAll).mockResolvedValue(mockPosts)

    const { result } = renderHook(() => useSupabasePosts())

    expect(result.current.loading).toBe(true)
    expect(result.current.posts).toEqual([])

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.posts).toEqual(mockPosts)
    expect(result.current.error).toBeNull()
  })

  it('handles loading error', async () => {
    const errorMessage = 'Failed to load posts'
    const { postsService } = await import('../lib/supabase')
    vi.mocked(postsService.getAll).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useSupabasePosts())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.posts).toEqual([])
  })

  it('creates a new post', async () => {
    const newPost = {
      id: '3',
      title: 'New Post',
      content: 'New Content',
      platform: 'instagram',
      user_id: 'test-user-id'
    }
    
    const { postsService, analyticsService } = await import('../lib/supabase')
    vi.mocked(postsService.create).mockResolvedValue(newPost)
    vi.mocked(analyticsService.logEvent).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSupabasePosts())

    await act(async () => {
      const createdPost = await result.current.createPost({
        title: 'New Post',
        content: 'New Content',
        platform: 'instagram'
      })
      expect(createdPost).toEqual(newPost)
    })

    expect(result.current.posts).toContain(newPost)
    expect(analyticsService.logEvent).toHaveBeenCalledWith('posts', '3', 'created', 'instagram')
  })

  it('updates a post', async () => {
    const updatedPost = {
      id: '1',
      title: 'Updated Post',
      content: 'Updated Content',
      platform: 'instagram'
    }
    
    const { postsService, analyticsService } = await import('../lib/supabase')
    vi.mocked(postsService.update).mockResolvedValue(updatedPost)
    vi.mocked(analyticsService.logEvent).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSupabasePosts())

    await act(async () => {
      const resultPost = await result.current.updatePost('1', {
        title: 'Updated Post',
        content: 'Updated Content'
      })
      expect(resultPost).toEqual(updatedPost)
    })

    expect(analyticsService.logEvent).toHaveBeenCalledWith('posts', '1', 'updated', undefined)
  })

  it('deletes a post', async () => {
    const { postsService, analyticsService } = await import('../lib/supabase')
    vi.mocked(postsService.delete).mockResolvedValue(undefined)
    vi.mocked(analyticsService.logEvent).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSupabasePosts())

    await act(async () => {
      await result.current.deletePost('1')
    })

    expect(postsService.delete).toHaveBeenCalledWith('1')
    expect(analyticsService.logEvent).toHaveBeenCalledWith('posts', '1', 'deleted')
  })
})

describe('useSupabaseScripts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  })

  it('loads scripts on mount', async () => {
    const mockScripts = [
      { id: '1', title: 'Script 1', content: 'Script Content 1', platform: 'youtube' },
      { id: '2', title: 'Script 2', content: 'Script Content 2', platform: 'tiktok' }
    ]
    
    const { scriptsService } = await import('../lib/supabase')
    vi.mocked(scriptsService.getAll).mockResolvedValue(mockScripts)

    const { result } = renderHook(() => useSupabaseScripts())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.scripts).toEqual(mockScripts)
  })

  it('creates a new script', async () => {
    const newScript = {
      id: '3',
      title: 'New Script',
      content: 'New Script Content',
      platform: 'youtube',
      user_id: 'test-user-id'
    }
    
    const { scriptsService, analyticsService } = await import('../lib/supabase')
    vi.mocked(scriptsService.create).mockResolvedValue(newScript)
    vi.mocked(analyticsService.logEvent).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSupabaseScripts())

    await act(async () => {
      const createdScript = await result.current.createScript({
        title: 'New Script',
        content: 'New Script Content',
        platform: 'youtube'
      })
      expect(createdScript).toEqual(newScript)
    })

    expect(result.current.scripts).toContain(newScript)
  })
})

describe('useSupabaseRankings Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  })

  it('loads rankings on mount', async () => {
    const mockRankings = [
      { id: '1', title: 'Ranking 1', content: 'Ranking Content 1' },
      { id: '2', title: 'Ranking 2', content: 'Ranking Content 2' }
    ]
    
    const { rankingsService } = await import('../lib/supabase')
    vi.mocked(rankingsService.getAll).mockResolvedValue(mockRankings)

    const { result } = renderHook(() => useSupabaseRankings())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.rankings).toEqual(mockRankings)
  })
})

describe('useSupabaseCaptions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  })

  it('loads captions on mount', async () => {
    const mockCaptions = [
      { id: '1', title: 'Caption 1', content: 'Caption Content 1', platform: 'instagram' },
      { id: '2', title: 'Caption 2', content: 'Caption Content 2', platform: 'tiktok' }
    ]
    
    const { captionsService } = await import('../lib/supabase')
    vi.mocked(captionsService.getAll).mockResolvedValue(mockCaptions)

    const { result } = renderHook(() => useSupabaseCaptions())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.captions).toEqual(mockCaptions)
  })

  it('handles no user authentication', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const { result } = renderHook(() => useSupabaseCaptions())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.captions).toEqual([])
    expect(result.current.error).toBe('Użytkownik nie jest zalogowany')
  })
})

describe('useSupabaseStats Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads stats on mount', async () => {
    const mockStats = {
      postsCount: 10,
      scriptsCount: 5,
      captionsCount: 8,
      rankingsCount: 3
    }
    
    const { analyticsService } = await import('../lib/supabase')
    vi.mocked(analyticsService.getUserStats).mockResolvedValue(mockStats)

    const { result } = renderHook(() => useSupabaseStats())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toEqual(mockStats)
  })

  it('handles stats loading error', async () => {
    const { analyticsService } = await import('../lib/supabase')
    vi.mocked(analyticsService.getUserStats).mockRejectedValue(new Error('Failed to load stats'))

    const { result } = renderHook(() => useSupabaseStats())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toBeNull()
  })
})