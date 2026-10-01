import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppSidebar from '../src/components/AppSidebar.vue'
import AppSearch from '../src/components/AppSearch.vue'

describe('AppSidebar', () => {
    it('renders its content', () => {
        expect(
            mount(AppSidebar, { slots: { default: '<nav>menu</nav>' } })
                .find('nav')
                .text(),
        ).toBe('menu')
    })

    it('is hidden on small screens until opened, always visible from md up', () => {
        const closed = mount(AppSidebar)
        expect(closed.classes()).toContain('-translate-x-full')
        expect(closed.classes()).toContain('md:translate-x-0')

        expect(mount(AppSidebar, { props: { open: true } }).classes()).toContain('translate-x-0')
    })
})

describe('AppSearch', () => {
    it('binds the query with v-model', async () => {
        const wrapper = mount(AppSearch, {
            props: {
                modelValue: 'but',
                'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
            },
        })
        const input = wrapper.find('input')
        expect(input.element.value).toBe('but')

        await input.setValue('button')

        expect(wrapper.props('modelValue')).toBe('button')
        expect(input.attributes('type')).toBe('search')
    })

    it('starts empty', () => {
        expect(mount(AppSearch).find('input').element.value).toBe('')
    })
})
