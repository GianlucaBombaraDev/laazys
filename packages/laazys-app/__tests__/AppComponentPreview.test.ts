import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AppComponentPreview from '../src/components/AppComponentPreview.vue'

const mountPreview = (props = {}) =>
    mount(AppComponentPreview, {
        props: { fileId: 'abc', status: { enabled: true }, revision: 0, ...props },
        attachTo: document.body,
    })

afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
})

// Dispatch a message as if it came from `source`
const postFrom = (source: unknown, data: unknown) =>
    window.dispatchEvent(new MessageEvent('message', { data, source: source as Window }))

describe('AppComponentPreview', () => {
    it('loads the preview page of the component, read-only', () => {
        const wrapper = mountPreview({ revision: 3 })
        const frame = wrapper.find('iframe')

        expect(frame.attributes('src')).toBe('/__laazys_preview/render/abc?revision=3')
        expect(frame.attributes('inert')).toBeDefined()
        expect(frame.attributes('tabindex')).toBe('-1')
        expect(frame.element.parentElement?.classList).toContain('pointer-events-none')
    })

    it('fits the height reported by its own frame only', async () => {
        const wrapper = mountPreview()
        const frame = wrapper.find('iframe')
        const ownWindow = (frame.element as HTMLIFrameElement).contentWindow

        postFrom({}, { type: 'laazys-preview-size', height: 999 })
        postFrom(ownWindow, { type: 'other', height: 999 })
        postFrom(ownWindow, null)
        await wrapper.vm.$nextTick()
        expect(frame.attributes('style')).toBe('height: 120px;')

        postFrom(ownWindow, { type: 'laazys-preview-size', height: 340 })
        await wrapper.vm.$nextTick()
        expect(frame.attributes('style')).toBe('height: 340px;')
    })

    it('stops listening when unmounted', () => {
        const remove = vi.spyOn(window, 'removeEventListener')

        mountPreview().unmount()

        expect(remove).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('explains why the preview is not available', () => {
        const wrapper = mountPreview({ status: { enabled: false, reason: 'Vite is not installed in the project' } })

        expect(wrapper.find('iframe').exists()).toBe(false)
        expect(wrapper.text()).toContain('Anteprima non disponibile: Vite is not installed in the project')
    })
})
