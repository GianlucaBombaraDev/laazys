import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppList from '../src/components/AppList.vue'
import { createTestRouter } from './helpers'

async function mountList(items: any[], currentPath = '/') {
    const router = createTestRouter()
    await router.push(currentPath)
    return mount(AppList, { props: { title: 'Components', items }, global: { plugins: [router] } })
}

describe('AppList', () => {
    it('links every item to its file page', async () => {
        const wrapper = await mountList([{ id: 'a', name: 'Button' }])

        expect(wrapper.find('h4').text()).toBe('Components')
        expect(wrapper.find('a').attributes('href')).toBe('/file/a')
        expect(wrapper.find('a').text()).toBe('Button')
    })

    it('highlights the file currently open', async () => {
        const wrapper = await mountList(
            [
                { id: 'a', name: 'Button' },
                { id: 'b', name: 'Card' },
            ],
            '/file/b',
        )
        const names = wrapper.findAll('a .truncate')

        expect(names[0].classes()).not.toContain('font-semibold')
        expect(names[1].classes()).toContain('font-semibold')
    })

    it.each([
        ['Deprecated', 'bg-deprecated-bg'],
        ['alpha', 'bg-alpha-bg'],
        ['beta', 'bg-beta-bg'],
        ['preAlpha', 'bg-preAlpha-bg'],
        ['inProgress', 'bg-warning-bg'],
        ['Ready', 'bg-success-bg'],
    ])('shows a %s badge', async (status, badgeClass) => {
        const wrapper = await mountList([{ id: 'a', name: 'Button', status }])
        const badge = wrapper.findAll('a > span')[1]

        expect(badge.text()).toBe(status)
        expect(badge.classes()).toContain(badgeClass)
    })

    it('strikes through deprecated items only', async () => {
        const wrapper = await mountList([
            { id: 'a', name: 'Old', status: 'deprecated' },
            { id: 'b', name: 'New', status: 'beta' },
        ])
        const names = wrapper.findAll('a .truncate')

        expect(names[0].classes()).toContain('line-through')
        expect(names[1].classes()).not.toContain('line-through')
    })

    it('shows an unknown status without colors and no badge without status', async () => {
        const wrapper = await mountList([
            { id: 'a', name: 'Custom', status: 'experimental' },
            { id: 'b', name: 'Plain' },
        ])
        const [custom, plain] = wrapper.findAll('a')

        expect(custom.findAll('span')[2].classes()).toEqual(['ml-[10px]', 'rounded-full', 'p-1', 'text-xs'])
        expect(plain.findAll('span')).toHaveLength(2)
    })

    it('renders an empty list by default', () => {
        const wrapper = mount(AppList, { props: { title: 'Empty' }, global: { plugins: [createTestRouter()] } })

        expect(wrapper.findAll('a')).toHaveLength(0)
    })
})
