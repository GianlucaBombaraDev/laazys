import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppSourceCode from '../src/components/AppSourceCode.vue'

describe('AppSourceCode', () => {
    it('highlights the snippet', () => {
        const wrapper = mount(AppSourceCode, { props: { source: '<Button :disabled="" />' } })

        expect(wrapper.find('pre .hljs-tag').exists()).toBe(true)
        expect(wrapper.find('pre').text()).toBe('<Button :disabled="" />')
    })

    it('updates when the snippet changes', async () => {
        const wrapper = mount(AppSourceCode, { props: { source: '<A />' } })

        await wrapper.setProps({ source: '<B />' })

        expect(wrapper.find('pre').text()).toBe('<B />')
    })

    it('renders an empty box without a snippet', () => {
        expect(mount(AppSourceCode).find('pre').exists()).toBe(false)
    })
})
