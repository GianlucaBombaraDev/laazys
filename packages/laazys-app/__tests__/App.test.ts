import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useFileStore } from '../src/store/file.store'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App.vue'
import AppFileList from '../src/components/AppFileList.vue'
import AppSidebar from '../src/components/AppSidebar.vue'
import { createTestRouter } from './helpers'

const files = [
    { id: 'a', name: 'Button', extension: 'vue', props: [{ name: 'disabled' }] },
    { id: 'b', name: 'useCounter', extension: 'ts' },
]

const api = vi.hoisted(() => ({
    getFiles: vi.fn(),
    getTheme: vi.fn(),
    getPreviewStatus: vi.fn(),
    onFilesUpdate: vi.fn(),
    stopUpdates: vi.fn(),
    onUpdate: () => {},
}))

vi.mock('../src/composable/useFiles', () => ({
    useFiles: () => ({
        getFiles: api.getFiles,
        getTheme: api.getTheme,
        getPreviewStatus: api.getPreviewStatus,
        getIcons: async () => ({}),
        onFilesUpdate: api.onFilesUpdate,
    }),
}))

afterEach(() => {
    vi.restoreAllMocks()
    document.getElementById('laazys-custom-theme')?.remove()
})

async function mountApp(path = '/file/a') {
    api.getFiles.mockResolvedValue(files)
    api.getTheme.mockResolvedValue({ dark: { primary: '1 2 3' } })
    api.getPreviewStatus.mockResolvedValue({ enabled: true })
    api.onFilesUpdate.mockImplementation((callback) => {
        api.onUpdate = callback
        return api.stopUpdates
    })
    const router = createTestRouter()
    await router.push(path)
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, { global: { plugins: [router, pinia] } })
    await flushPromises()
    return { wrapper, router, store: useFileStore() }
}

const listedNames = (wrapper: any) =>
    wrapper
        .findComponent(AppFileList)
        .props('files')
        .map((file: { name: string }) => file.name)

describe('App', () => {
    it('shows nothing until the files are loaded', () => {
        api.getFiles.mockReturnValue(new Promise(() => {}))
        api.getTheme.mockResolvedValue({})
        api.getPreviewStatus.mockResolvedValue({ enabled: false, reason: '' })
        api.onFilesUpdate.mockReturnValue(() => {})
        const wrapper = mount(App, { global: { plugins: [createTestRouter(), createPinia()] } })

        expect(wrapper.findComponent(AppFileList).exists()).toBe(false)
        expect(wrapper.find('main').exists()).toBe(false)
    })

    it('loads the files, the custom theme and shows the page', async () => {
        const { wrapper } = await mountApp()

        expect(listedNames(wrapper)).toEqual(['Button', 'useCounter'])
        expect(wrapper.find('main').exists()).toBe(true)
        expect(document.getElementById('laazys-custom-theme')?.textContent).toContain('--color-primary: 1 2 3')
    })

    it('filters the list with the search box', async () => {
        const { wrapper } = await mountApp()

        await wrapper.find('input[type="search"]').setValue('disabled')

        expect(listedNames(wrapper)).toEqual(['Button'])
    })

    it('says when nothing matches the search', async () => {
        const { wrapper } = await mountApp()

        await wrapper.find('input[type="search"]').setValue('zzz')

        expect(wrapper.findComponent(AppFileList).exists()).toBe(false)
        expect(wrapper.text()).toContain('Nessun risultato per “zzz”.')
    })

    it('stores the preview status', async () => {
        const { store } = await mountApp()

        expect(store.preview).toEqual({ enabled: true })
    })

    it('reloads the files and bumps the revision when the CLI regenerates them', async () => {
        const { wrapper, store } = await mountApp()
        api.getFiles.mockResolvedValue([files[0]])

        api.onUpdate()
        await flushPromises()

        expect(listedNames(wrapper)).toEqual(['Button'])
        expect(store.revision).toBe(1)
    })

    it('stops listening for updates when unmounted', async () => {
        const { wrapper } = await mountApp()

        wrapper.unmount()

        expect(api.stopUpdates).toHaveBeenCalled()
    })

    it('opens the sidebar from the menu button and closes it from the overlay', async () => {
        const { wrapper } = await mountApp()
        const menu = wrapper.find('button[aria-label="Apri il menu"]')

        await menu.trigger('click')
        expect(wrapper.findComponent(AppSidebar).props('open')).toBe(true)
        expect(menu.attributes('aria-expanded')).toBe('true')

        await wrapper.find('.bg-black\\/40').trigger('click')
        expect(wrapper.findComponent(AppSidebar).props('open')).toBe(false)
        expect(wrapper.find('.bg-black\\/40').exists()).toBe(false)
    })

    it('closes the sidebar after navigating', async () => {
        const { wrapper, router } = await mountApp()
        await wrapper.find('button[aria-label="Apri il menu"]').trigger('click')

        await router.push('/file/b')
        await flushPromises()

        expect(wrapper.findComponent(AppSidebar).props('open')).toBe(false)
    })

    it.each(['laazys logo', 'laazys'])('goes back home from the "%s" logo', async (alt) => {
        const { wrapper, router } = await mountApp()

        await wrapper.find(`img[alt="${alt}"]`).trigger('click')
        await flushPromises()

        expect(router.currentRoute.value.path).toBe('/')
    })
})
