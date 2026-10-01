import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppFileHeader from '../src/components/AppFileHeader.vue'

describe('AppFileHeader', () => {
    it('shows name, path, description and requirements', () => {
        const wrapper = mount(AppFileHeader, {
            props: { name: 'Button', path: '/src/Button.vue', description: 'A button', requires: 'Form.vue' },
        })

        expect(wrapper.find('h2').text()).toBe('Button')
        expect(wrapper.text()).toContain('/src/Button.vue')
        expect(wrapper.text()).toContain('A button')
        expect(wrapper.find('strong').text()).toBe('Form.vue')
    })

    it('hides description and requirements when missing', () => {
        const wrapper = mount(AppFileHeader, { props: { name: 'Button', path: '/src/Button.vue' } })

        expect(wrapper.findAll('p')).toHaveLength(1)
        expect(wrapper.find('strong').exists()).toBe(false)
    })
})
