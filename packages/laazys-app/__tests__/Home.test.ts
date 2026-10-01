import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import Home from '../src/pages/Home.vue'
import AppAnalysisSection from '../src/components/AppAnalysisSection.vue'
import { useFileStore } from '../src/store/file.store'
import { createTestRouter } from './helpers'

beforeEach(() => {
    setActivePinia(createPinia())
})

const mountHome = (files: any[] | null) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useFileStore().files = files
    return mount(Home, { global: { plugins: [pinia, createTestRouter()] } })
}

describe('Home (overview)', () => {
    const files = [
        { id: 'a', name: 'Old', extension: 'vue', status: 'deprecated', description: 'x' },
        { id: 'b', name: 'New', extension: 'vue', methods: [{ name: 'open' }] },
        { id: 'c', name: 'useCounter', extension: 'ts' },
    ]

    it('shows the totals', () => {
        const tiles = mountHome(files)
            .findAll('.grid > div')
            .slice(0, 4)
            .map((tile) => tile.text())

        expect(tiles).toEqual(['Componenti2', 'Composable1', 'Deprecati1', 'Senza descrizione1'])
    })

    it('shows how many components have each status', () => {
        const statuses = mountHome(files)
            .findAll('section li')
            .slice(0, 2)
            .map((item) => item.text())

        expect(statuses).toEqual(['deprecated: 1', 'senza stato: 1'])
    })

    it('lists the components and methods that need attention', () => {
        const sections = mountHome(files).findAllComponents(AppAnalysisSection)

        expect(sections.map((section) => [section.props('title'), section.props('items')])).toEqual([
            ['Componenti deprecati', [{ id: 'a', label: 'Old' }]],
            ['Componenti senza descrizione', [{ id: 'b', label: 'New' }]],
            ['Metodi senza descrizione', [{ id: 'b', label: 'open()', detail: 'New' }]],
        ])
    })

    it('shows zeros before the files are loaded', () => {
        expect(mountHome(null).find('.text-3xl').text()).toBe('0')
    })
})
