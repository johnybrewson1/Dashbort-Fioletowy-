import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMagicAgent } from '../hooks/useMagicAgent'

// Mock dependencies
vi.mock('../components/ui/use-toast', () => ({
  toast: vi.fn()
}))

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      voiceForPosts: 'friendly',
      voiceForScripts: 'professional',
      style: 'modern',
      avatarRecipient: 'audience',
      brandDescription: 'Test brand',
      language: 'pl'
    }
  })
}))

vi.mock('../hooks/useSupabaseUser', () => ({
  useSupabaseUser: () => ({
    userId: 'test-user-id'
  })
}))

vi.mock('../lib/config', () => ({
  buildApiUrl: (path: string) => `https://api.test.com${path}`
}))

// Mock fetch
global.fetch = vi.fn()

describe('useMagicAgent Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useMagicAgent())

    expect(result.current.content).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.selectedPlatforms).toEqual({
      instagram: false,
      tiktok: false,
      youtube: false,
      linkedin: false,
      x: false,
      facebook: false,
      blog: false,
    })
    expect(result.current.selectedContentTypes).toEqual({
      instagram: [],
      tiktok: [],
      youtube: [],
      linkedin: [],
      x: [],
      facebook: [],
      blog: []
    })
    expect(result.current.imageUrl).toBe('')
    expect(result.current.blogPurpose).toBe('')
    expect(result.current.useThumbnail).toBe(false)
  })

  it('updates content when setContent is called', () => {
    const { result } = renderHook(() => useMagicAgent())

    act(() => {
      result.current.setContent('Test content')
    })

    expect(result.current.content).toBe('Test content')
  })

  it('updates imageUrl when setImageUrl is called', () => {
    const { result } = renderHook(() => useMagicAgent())

    act(() => {
      result.current.setImageUrl('https://example.com/image.jpg')
    })

    expect(result.current.imageUrl).toBe('https://example.com/image.jpg')
  })

  it('updates blogPurpose when setBlogPurpose is called', () => {
    const { result } = renderHook(() => useMagicAgent())

    act(() => {
      result.current.setBlogPurpose('Educational content')
    })

    expect(result.current.blogPurpose).toBe('Educational content')
  })

  it('updates useThumbnail when setUseThumbnail is called', () => {
    const { result } = renderHook(() => useMagicAgent())

    act(() => {
      result.current.setUseThumbnail(true)
    })

    expect(result.current.useThumbnail).toBe(true)
  })

  it('handles platform changes correctly', () => {
    const { result } = renderHook(() => useMagicAgent())

    const newPlatforms = {
      instagram: true,
      tiktok: false,
      youtube: true,
      linkedin: false,
      x: false,
      facebook: false,
      blog: false,
    }

    act(() => {
      result.current.handlePlatformChange(newPlatforms)
    })

    expect(result.current.selectedPlatforms).toEqual(newPlatforms)
  })

  it('resets useThumbnail when YouTube is deselected', () => {
    const { result } = renderHook(() => useMagicAgent())

    // First set useThumbnail to true
    act(() => {
      result.current.setUseThumbnail(true)
    })
    expect(result.current.useThumbnail).toBe(true)

    // Then deselect YouTube
    const platformsWithoutYouTube = {
      instagram: true,
      tiktok: false,
      youtube: false,
      linkedin: false,
      x: false,
      facebook: false,
      blog: false,
    }

    act(() => {
      result.current.handlePlatformChange(platformsWithoutYouTube)
    })

    expect(result.current.useThumbnail).toBe(false)
  })

  it('handles content type changes correctly', () => {
    const { result } = renderHook(() => useMagicAgent())

    act(() => {
      result.current.handleContentTypeChange('instagram', ['post', 'story'])
    })

    expect(result.current.selectedContentTypes.instagram).toEqual(['post', 'story'])
  })

  it('shows error toast when content is empty on submit', async () => {
    const { result } = renderHook(() => useMagicAgent())
    const { toast } = await import('../components/ui/use-toast')

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(false)
    })

    expect(toast).toHaveBeenCalledWith({
      title: "Błąd",
      description: "Pole treści jest wymagane",
      variant: "destructive",
    })
  })

  it('shows error toast when no platform is selected on submit', async () => {
    const { result } = renderHook(() => useMagicAgent())
    const { toast } = await import('../components/ui/use-toast')

    act(() => {
      result.current.setContent('Test content')
    })

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(false)
    })

    expect(toast).toHaveBeenCalledWith({
      title: "Błąd",
      description: "Wybierz przynajmniej jedną platformę",
      variant: "destructive",
    })
  })

  it('successfully submits when valid data is provided', async () => {
    const { result } = renderHook(() => useMagicAgent())
    const { toast } = await import('../components/ui/use-toast')

    // Mock successful response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    act(() => {
      result.current.setContent('Test content')
      result.current.handlePlatformChange({
        instagram: true,
        tiktok: false,
        youtube: false,
        linkedin: false,
        x: false,
        facebook: false,
        blog: false,
      })
    })

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(true)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/api/generate',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: expect.stringContaining('Test content')
      })
    )

    expect(toast).toHaveBeenCalledWith({
      title: "Sukces! 🎉",
      description: "Twój post został wygenerowany!",
    })

    // Check that form is reset
    expect(result.current.content).toBe('')
    expect(result.current.selectedPlatforms).toEqual({
      instagram: false,
      tiktok: false,
      youtube: false,
      linkedin: false,
      x: false,
      facebook: false,
      blog: false,
    })
  })

  it('handles API error correctly', async () => {
    const { result } = renderHook(() => useMagicAgent())
    const { toast } = await import('../components/ui/use-toast')

    // Mock error response
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    act(() => {
      result.current.setContent('Test content')
      result.current.handlePlatformChange({
        instagram: true,
        tiktok: false,
        youtube: false,
        linkedin: false,
        x: false,
        facebook: false,
        blog: false,
      })
    })

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(false)
    })

    expect(toast).toHaveBeenCalledWith({
      title: "Błąd",
      description: "Wystąpił błąd podczas generowania postu. Spróbuj ponownie.",
      variant: "destructive",
    })
  })

  it('sets loading state during submission', async () => {
    const { result } = renderHook(() => useMagicAgent())

    // Mock delayed response
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    ;(global.fetch as any).mockReturnValueOnce(promise)

    act(() => {
      result.current.setContent('Test content')
      result.current.handlePlatformChange({
        instagram: true,
        tiktok: false,
        youtube: false,
        linkedin: false,
        x: false,
        facebook: false,
        blog: false,
      })
    })

    // Start submission
    act(() => {
      result.current.handleSubmit()
    })

    // Check loading state
    expect(result.current.loading).toBe(true)

    // Resolve the promise
    act(() => {
      resolvePromise!({ ok: true, json: () => Promise.resolve({ success: true }) })
    })

    // Wait for completion
    await act(async () => {
      await promise
    })

    expect(result.current.loading).toBe(false)
  })
})
