import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import { createApp, startServer } from '../utils/server'
import { DEFAULT_APP_DIR, DEFAULT_PORT, run } from '../utils/cli'
import { createPreview } from '../utils/preview'

// Keep the real port 3000 free: only check which defaults reach the server
vi.mock('../utils/server', async (importOriginal) => ({
    DocsState: (await importOriginal<typeof import('../utils/server')>()).DocsState,
    createApp: vi.fn(() => 'app'),
    startServer: vi.fn(async () => ({ server: 'server', port: 3000 })),
}))
vi.mock('../utils/get-documentations', () => ({ getDocumentation: vi.fn(async () => []) }))
vi.mock('../utils/preview', () => ({ createPreview: vi.fn(async () => ({ enabled: false, reason: 'mocked' })) }))

describe('run defaults', () => {
    it('serves the bundled UI on port 3000', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})

        await run(['-p', '.'])

        expect(DEFAULT_PORT).toBe(3000)
        expect(DEFAULT_APP_DIR).toBe(path.join(__dirname, '..', '..', 'app'))
        // No --theme: an empty theme keeps the built-in colors
        expect(createApp).toHaveBeenCalledWith(expect.objectContaining({ files: [] }), DEFAULT_APP_DIR, {
            theme: {},
            preview: { enabled: false, reason: 'mocked' },
        })
        // The preview is on by default
        expect(createPreview).toHaveBeenCalledWith('.', undefined)
        expect(startServer).toHaveBeenCalledWith('app', DEFAULT_PORT)
    })
})
