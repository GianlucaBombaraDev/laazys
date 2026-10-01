import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyCustomTheme, getInitialDark, saveTheme, setDarkClass } from '../src/composable/useTheme'

const prefersDark = (matches: boolean) => vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList)

afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.body.className = ''
    document.getElementById('laazys-custom-theme')?.remove()
})

describe('getInitialDark', () => {
    it.each([
        ['dark', true],
        ['light', false],
    ])('uses the saved "%s" choice over the system preference', (saved, expected) => {
        localStorage.setItem('laazys-theme', saved)
        prefersDark(!expected)

        expect(getInitialDark()).toBe(expected)
    })

    it.each([true, false])('follows the system preference (dark: %s) without a saved choice', (dark) => {
        prefersDark(dark)

        expect(getInitialDark()).toBe(dark)
        expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('falls back to the system preference when storage is blocked', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError')
        })
        prefersDark(true)

        expect(getInitialDark()).toBe(true)
    })
})

describe('setDarkClass and saveTheme', () => {
    it('toggles the dark-theme class on the body', () => {
        setDarkClass(true)
        expect(document.body.classList).toContain('dark-theme')

        setDarkClass(false)
        expect(document.body.classList).not.toContain('dark-theme')
    })

    it('saves the choice', () => {
        saveTheme(true)
        expect(localStorage.getItem('laazys-theme')).toBe('dark')

        saveTheme(false)
        expect(localStorage.getItem('laazys-theme')).toBe('light')
    })

    it('ignores a blocked storage', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError')
        })

        expect(() => saveTheme(true)).not.toThrow()
    })
})

describe('applyCustomTheme', () => {
    const style = () => document.getElementById('laazys-custom-theme')

    it('injects the custom colors for both modes', () => {
        applyCustomTheme({ light: { primary: '1 2 3' }, dark: { body: '4 5 6', 'body-text': '7 8 9' } })

        expect(style()?.parentElement).toBe(document.head)
        expect(style()?.textContent).toBe(
            ':root { --color-primary: 1 2 3; }\nbody.dark-theme { --color-body: 4 5 6; --color-body-text: 7 8 9; }',
        )
    })

    it('replaces the previous custom theme instead of adding styles', () => {
        applyCustomTheme({ light: { primary: '1 2 3' } })
        applyCustomTheme({ dark: { accent: '9 9 9' } })

        expect(document.querySelectorAll('#laazys-custom-theme')).toHaveLength(1)
        expect(style()?.textContent).toBe('body.dark-theme { --color-accent: 9 9 9; }')
    })

    it('leaves the default colors alone with an empty theme', () => {
        applyCustomTheme({})

        expect(style()?.textContent).toBe('')
    })
})
