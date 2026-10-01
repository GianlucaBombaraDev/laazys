import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppAnalysisSection from '../src/components/AppAnalysisSection.vue'
import { createTestRouter } from './helpers'

const mountSection = (items: any[]) =>
    mount(AppAnalysisSection, {
        props: { title: 'Deprecati', items, emptyText: 'Niente da segnalare.' },
        global: { plugins: [createTestRouter()] },
    })

describe('AppAnalysisSection', () => {
    it('links each item to its file, with the optional detail', () => {
        const wrapper = mountSection([
            { id: 'a', label: 'Old' },
            { id: 'b', label: 'reset()', detail: 'useCounter' },
        ])
        const items = wrapper.findAll('li')

        expect(wrapper.find('h2').text()).toBe('Deprecati (2)')
        expect(items[0].find('a').attributes('href')).toBe('/file/a')
        expect(items[0].text()).toBe('Old')
        expect(items[1].text()).toBe('reset() in useCounter')
    })

    it('shows the empty text without items', () => {
        const wrapper = mountSection([])

        expect(wrapper.find('ul').exists()).toBe(false)
        expect(wrapper.find('p').text()).toBe('Niente da segnalare.')
    })
})
