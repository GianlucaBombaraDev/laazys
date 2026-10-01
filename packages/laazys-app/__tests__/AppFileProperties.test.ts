import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppFileProperties from '../src/components/AppFileProperties.vue'

describe('AppFileProperties', () => {
    const wrapper = mount(AppFileProperties, {
        props: {
            label: 'props',
            properties: [
                { name: 'disabled', type: { name: 'boolean' }, defaultValue: { func: false, value: 'false' } },
                { name: 'count', type: { name: 'number' } },
                { name: 'title', type: { name: 'string' } },
                { name: 'handler', type: { name: 'function' } },
                { name: 'slotLike' },
            ],
        },
    })
    const rows = wrapper.findAll('.grid')

    it('renders one row per property with its label', () => {
        expect(rows).toHaveLength(5)
        expect(rows[0].text()).toContain('props')
        expect(rows[0].text()).toContain('disabled')
    })

    it('colors the type by kind', () => {
        expect(rows[0].find('.text-purple-400').text()).toBe('boolean')
        expect(rows[1].find('.text-green-400').text()).toBe('number')
        expect(rows[2].find('.text-blue-400').text()).toBe('string')
        expect(rows[3].find('.text-bodyText').text()).toBe('function')
    })

    it('shows the default value, not the raw vue-docgen object', () => {
        expect(rows[0].text()).toContain('false')
        expect(rows[0].text()).not.toContain('func')
    })

    it('omits the type when it is unknown', () => {
        expect(rows[4].findAll('span')).toHaveLength(3)
        expect(rows[4].text()).toBe('propsslotLike')
    })
})
