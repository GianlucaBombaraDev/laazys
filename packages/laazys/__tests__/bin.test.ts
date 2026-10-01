import { afterEach, describe, expect, it, vi } from 'vitest'
import { run } from '../utils/cli'

vi.mock('../utils/cli', () => ({ run: vi.fn() }))

const originalArgv = process.argv

afterEach(() => {
    process.argv = originalArgv
    vi.restoreAllMocks()
    vi.resetModules()
})

describe('bin/laazys', () => {
    it('passes the command line arguments to run', async () => {
        vi.mocked(run).mockResolvedValue({} as any)
        process.argv = ['node', 'laazys', '-p', './src']

        await import('../bin/laazys')

        expect(run).toHaveBeenCalledWith(['-p', './src'])
    })

    it('prints the error and exits with code 1 when run fails', async () => {
        const error = new Error('boom')
        vi.mocked(run).mockRejectedValue(error)
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const exit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any)

        await import('../bin/laazys')
        await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1))

        expect(consoleError).toHaveBeenCalledWith(error)
    })
})
