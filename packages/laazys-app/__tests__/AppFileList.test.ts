import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppFileList from '../src/components/AppFileList.vue'
import AppList from '../src/components/AppList.vue'
import { createTestRouter } from './helpers'

const mountFileList = (props = {}) => mount(AppFileList, { props, global: { plugins: [createTestRouter()] } })

describe('AppFileList', () => {
    it('splits components and composables', () => {
        const wrapper = mountFileList({
            files: [
                { id: 'a', name: 'Button', extension: 'vue', status: 'beta', path: '/x' },
                { id: 'b', name: 'useCounter', extension: 'js' },
            ],
        })
        const [components, composables] = wrapper.findAllComponents(AppList)

        expect(components.props('title')).toBe('Componenti')
        expect(components.props('items')).toEqual([{ id: 'a', name: 'Button', extension: 'vue', status: 'beta' }])
        expect(composables.props('title')).toBe('Composable')
        expect(composables.props('items')).toEqual([
            { id: 'b', name: 'useCounter', extension: 'js', status: undefined },
        ])
    })

    it('renders empty lists without files', () => {
        const lists = mountFileList().findAllComponents(AppList)

        expect(lists.map((list) => list.props('items'))).toEqual([[], []])
    })
})
