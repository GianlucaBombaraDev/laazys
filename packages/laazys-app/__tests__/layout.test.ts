import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppSidebar from '../src/components/AppSidebar.vue'
import Home from '../src/pages/Home.vue'

describe('layout components', () => {
    it('AppSidebar renders its content', () => {
        expect(
            mount(AppSidebar, { slots: { default: '<nav>menu</nav>' } })
                .find('nav')
                .text(),
        ).toBe('menu')
    })

    it('Home renders the landing text', () => {
        expect(mount(Home).text()).toBe('sono la home')
    })
})
