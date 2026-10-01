import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AppThemeSwitch from '../src/components/AppThemeSwitch.vue'

const mountSwitch = () => mount(AppThemeSwitch, { global: { stubs: { AppIcon: true } } })
const prefersDark = (matches: boolean) => vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList)

afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.body.className = ''
})

describe('AppThemeSwitch', () => {
    it('starts from the system preference without saving it', () => {
        prefersDark(true)
        const [sun, moon] = mountSwitch().findAll('button')

        expect(document.body.classList).toContain('dark-theme')
        expect(moon.attributes('aria-pressed')).toBe('true')
        expect(sun.attributes('aria-pressed')).toBe('false')
        expect(localStorage.getItem('laazys-theme')).toBeNull()
    })

    it('switches theme and remembers the choice', async () => {
        prefersDark(false)
        const wrapper = mountSwitch()
        const [sun, moon] = wrapper.findAll('button')
        expect(sun.classes()).toContain('bg-accent')

        await moon.trigger('click')
        expect(document.body.classList).toContain('dark-theme')
        expect(moon.classes()).toContain('bg-accent')
        expect(sun.classes()).not.toContain('bg-accent')
        expect(localStorage.getItem('laazys-theme')).toBe('dark')

        await sun.trigger('click')
        expect(document.body.classList).not.toContain('dark-theme')
        expect(localStorage.getItem('laazys-theme')).toBe('light')
    })

    it('labels the buttons and their icons', () => {
        prefersDark(false)
        const wrapper = mountSwitch()

        expect(wrapper.findAll('button').map((button) => button.attributes('aria-label'))).toEqual([
            'Tema chiaro',
            'Tema scuro',
        ])
        expect(wrapper.findAll('app-icon-stub').map((icon) => icon.attributes('name'))).toEqual(['sun', 'moon'])
    })
})
