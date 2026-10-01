import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App.vue'
import AppFileList from '../src/components/AppFileList.vue'
import { createTestRouter } from './helpers'

const files = [{ id: 'a', name: 'Button', extension: 'vue' }]
let resolveFiles: (value: unknown) => void

vi.mock('../src/composable/useFiles', () => ({
    useFiles: () => ({
        getFiles: () => new Promise((resolve) => (resolveFiles = resolve)),
        getIcons: async () => ({}),
    }),
}))

describe('App', () => {
    it('loads the files, then shows the list and the page', async () => {
        const router = createTestRouter()
        await router.push('/file/a')
        const wrapper = mount(App, { global: { plugins: [router, createPinia()] } })

        expect(wrapper.findComponent(AppFileList).exists()).toBe(false)

        resolveFiles(files)
        await flushPromises()

        expect(wrapper.findComponent(AppFileList).props('files')).toEqual(files)
        expect(wrapper.find('.fixed.left-\\[300px\\]').exists()).toBe(true)
    })

    it('goes back home when the logo is clicked', async () => {
        const router = createTestRouter()
        await router.push('/file/a')
        const wrapper = mount(App, { global: { plugins: [router, createPinia()] } })

        await wrapper.find('img[alt="laazys logo"]').trigger('click')
        await flushPromises()

        expect(router.currentRoute.value.path).toBe('/')
    })
})
