import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppFigma from '../src/components/AppFigma.vue'

const URL = 'https://www.figma.com/design/abc/Panel'

describe('AppFigma', () => {
    it('links the design in a new tab', () => {
        const link = mount(AppFigma, { props: { url: URL } }).find('a')

        expect(link.attributes('href')).toBe(URL)
        expect(link.attributes('target')).toBe('_blank')
        expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('embeds the design only on request', async () => {
        const wrapper = mount(AppFigma, { props: { url: URL } })
        const toggle = wrapper.find('button')
        expect(wrapper.find('iframe').exists()).toBe(false)

        await toggle.trigger('click')
        expect(wrapper.find('iframe').attributes('src')).toContain('https://www.figma.com/embed?')
        expect(toggle.text()).toBe('Nascondi il design')

        await toggle.trigger('click')
        expect(wrapper.find('iframe').exists()).toBe(false)
        expect(toggle.text()).toBe('Mostra il design')
    })

    it('never turns an invalid link into a link or an embed', () => {
        const wrapper = mount(AppFigma, { props: { url: 'javascript:alert(1)' } })

        expect(wrapper.find('a').exists()).toBe(false)
        expect(wrapper.find('iframe').exists()).toBe(false)
        expect(wrapper.text()).toContain('Link Figma non valido')
    })
})
