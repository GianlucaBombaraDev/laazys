import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AppThemeSwitch from '../src/components/AppThemeSwitch.vue'

const mountSwitch = () => mount(AppThemeSwitch, { global: { stubs: { AppIcon: true } } })

afterEach(() => {
    document.body.classList.remove('dark-theme')
})

describe('AppThemeSwitch', () => {
    it('starts in light mode with the sun highlighted', () => {
        const [sun, moon] = mountSwitch().findAll('.rounded-full')

        expect(sun.classes()).toContain('bg-accent')
        expect(moon.classes()).not.toContain('bg-accent')
        expect(document.body.classList).not.toContain('dark-theme')
    })

    it('toggles the dark theme on the body', async () => {
        const wrapper = mountSwitch()
        const [sun, moon] = wrapper.findAll('.rounded-full')

        await moon.trigger('click')
        expect(document.body.classList).toContain('dark-theme')
        expect(moon.classes()).toContain('bg-accent')
        expect(sun.classes()).not.toContain('bg-accent')

        await sun.trigger('click')
        expect(document.body.classList).not.toContain('dark-theme')
    })

    it('shows a sun and a moon icon', () => {
        const icons = mountSwitch().findAll('app-icon-stub')

        expect(icons.map((icon) => icon.attributes('name'))).toEqual(['sun', 'moon'])
    })
})
