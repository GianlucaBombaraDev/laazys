import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import File from '../src/pages/File.vue'
import AppFileHeader from '../src/components/AppFileHeader.vue'
import AppFileProperties from '../src/components/AppFileProperties.vue'
import AppSourceCode from '../src/components/AppSourceCode.vue'
import { useFileStore } from '../src/store/file.store'
import { createTestRouter } from './helpers'

const files = [
    {
        id: 'full',
        name: 'Full',
        path: '/src/Full.vue',
        extension: 'vue',
        sourceCode: '<Full />',
        props: [{ name: 'isActive' }],
        slots: [{ name: 'default' }],
        events: [{ name: 'update' }],
        methods: [{ name: 'open' }],
    },
    { id: 'bare', name: 'Bare', path: '/src/Bare.vue', extension: 'vue' },
]

async function mountAt(path: string) {
    const pinia = createPinia()
    setActivePinia(pinia)
    useFileStore().files = files
    const router = createTestRouter()
    await router.push(path)
    const wrapper = mount(File, { global: { plugins: [router, pinia] } })
    await flushPromises()
    return { wrapper, router }
}

beforeEach(() => {
    setActivePinia(createPinia())
})

describe('File page', () => {
    it('shows every documented section of the file', async () => {
        const { wrapper } = await mountAt('/file/full')

        expect(wrapper.findComponent(AppFileHeader).props('name')).toBe('Full')
        expect(wrapper.findAllComponents(AppFileProperties).map((section) => section.props('label'))).toEqual([
            'props',
            'slots',
            'emits',
            'methods',
        ])
        expect(wrapper.findComponent(AppSourceCode).props('source')).toBe('<Full />')
    })

    it('hides the sections a file does not have', async () => {
        const { wrapper } = await mountAt('/file/bare')

        expect(wrapper.findComponent(AppFileHeader).props('name')).toBe('Bare')
        expect(wrapper.findAllComponents(AppFileProperties)).toHaveLength(0)
        expect(wrapper.findComponent(AppSourceCode).exists()).toBe(false)
    })

    it('follows navigation to another file', async () => {
        const { wrapper, router } = await mountAt('/file/full')

        await router.push('/file/bare')
        await flushPromises()

        expect(wrapper.findComponent(AppFileHeader).props('name')).toBe('Bare')
    })

    it('renders no header for an unknown file', async () => {
        const { wrapper } = await mountAt('/file/missing')

        expect(wrapper.findComponent(AppFileHeader).exists()).toBe(false)
    })
})
