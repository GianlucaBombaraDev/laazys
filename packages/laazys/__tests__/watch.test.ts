import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { watchFolder } from '../utils/watch'

afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
})

// Capture the fs.watch callback to drive it with exact file names
function fakeWatch() {
    const close = vi.fn()
    let emit: (event: string, filename: string | null) => void = () => {}
    vi.spyOn(fs, 'watch').mockImplementation(((dir: string, options: object, listener: typeof emit) => {
        emit = listener
        return { close }
    }) as any)
    return { emit: (filename: string | null) => emit('change', filename), close }
}

describe('watchFolder', () => {
    it('watches the folder recursively', () => {
        fakeWatch()
        watchFolder('/project/src', () => {})

        expect(fs.watch).toHaveBeenCalledWith('/project/src', { recursive: true }, expect.any(Function))
    })

    it('calls onChange once a burst of changes settles', () => {
        vi.useFakeTimers()
        const { emit } = fakeWatch()
        const onChange = vi.fn()
        watchFolder('/project/src', onChange, 100)

        emit('Button.vue')
        emit(path.join('composables', 'useCard.ts'))
        vi.advanceTimersByTime(99)
        expect(onChange).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it.each([
        ['no file name', null],
        ['not documentable', 'notes.md'],
        ['type declaration', 'types.d.ts'],
        ['inside node_modules', path.join('node_modules', 'lib', 'Ignored.vue')],
        ['inside a hidden folder', path.join('.cache', 'Ignored.vue')],
    ])('ignores changes with %s', (label, filename) => {
        vi.useFakeTimers()
        const { emit } = fakeWatch()
        const onChange = vi.fn()
        watchFolder('/project/src', onChange)

        emit(filename)
        vi.runAllTimers()

        expect(onChange).not.toHaveBeenCalled()
    })

    it('stops watching and drops a pending change', () => {
        vi.useFakeTimers()
        const { emit, close } = fakeWatch()
        const onChange = vi.fn()
        const stop = watchFolder('/project/src', onChange)

        emit('Button.vue')
        stop()
        vi.runAllTimers()

        expect(close).toHaveBeenCalled()
        expect(onChange).not.toHaveBeenCalled()
    })

    it('reacts to real file changes', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'laazys-watch-'))
        const onChange = vi.fn()
        const stop = watchFolder(dir, onChange, 20)

        try {
            fs.writeFileSync(path.join(dir, 'Button.vue'), '<template />')
            await vi.waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 2000 })
        } finally {
            stop()
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })
})
