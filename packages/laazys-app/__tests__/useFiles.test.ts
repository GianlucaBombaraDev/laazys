import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFiles } from '../src/composable/useFiles'

vi.mock('axios', () => ({ default: { get: vi.fn() } }))

afterEach(() => {
    vi.restoreAllMocks()
})

describe('useFiles', () => {
    it('fetches the files from the same origin', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: [{ id: 'a' }] })

        await expect(useFiles().getFiles()).resolves.toEqual([{ id: 'a' }])
        expect(axios.get).toHaveBeenCalledWith(`${window.location.origin}/files`)
    })

    it('returns an empty list when the files cannot be loaded', async () => {
        const error = new Error('offline')
        vi.mocked(axios.get).mockRejectedValue(error)
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

        await expect(useFiles().getFiles()).resolves.toEqual([])
        expect(consoleError).toHaveBeenCalledWith('Error loading files:', error)
    })

    it('fetches the icons from the site root', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { sun: '<svg />' } })

        await expect(useFiles().getIcons()).resolves.toEqual({ sun: '<svg />' })
        expect(axios.get).toHaveBeenCalledWith('/icons.json')
    })

    it('returns no icons when they cannot be loaded', async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error('404'))
        vi.spyOn(console, 'error').mockImplementation(() => {})

        await expect(useFiles().getIcons()).resolves.toEqual({})
    })
})
