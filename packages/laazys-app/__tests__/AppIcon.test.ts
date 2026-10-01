import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AppIcon from '../src/components/AppIcon.vue'

vi.mock('../src/composable/useFiles', () => ({
    useFiles: () => ({ getIcons: async () => ({ sun: '<svg id="sun"></svg>', add: '<svg id="add"></svg>' }) }),
}))

describe('AppIcon', () => {
    it('renders the named icon with the given size', async () => {
        const wrapper = mount(AppIcon, { props: { name: 'sun', sizing: { width: 'w-[20px]', height: 'h-[20px]' } } })
        await flushPromises()

        expect(wrapper.find('svg#sun').exists()).toBe(true)
        expect(wrapper.classes()).toEqual(['h-[20px]', 'w-[20px]'])
    })

    it('defaults to the "add" icon at 24px', async () => {
        const wrapper = mount(AppIcon)
        await flushPromises()

        expect(wrapper.find('svg#add').exists()).toBe(true)
        expect(wrapper.classes()).toEqual(['h-[24px]', 'w-[24px]'])
    })

    it('renders nothing for an unknown icon', async () => {
        const wrapper = mount(AppIcon, { props: { name: 'missing' } })
        await flushPromises()

        expect(wrapper.html()).toBe('<!--v-if-->')
    })
})
