import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent } from 'vue'
import { vi } from 'vitest'

// Real router with the app's route names, rendering nothing for the pages
export function createTestRouter() {
    const Page = defineComponent({ template: '<div />' })
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'home', component: Page },
            { path: '/file/:id', name: 'file', component: Page },
        ],
    })
}

/** Stand-in for EventSource: records listeners so tests can fire server events */
export class FakeEventSource {
    static instances: FakeEventSource[] = []
    listeners: Record<string, () => void> = {}
    close = vi.fn()

    constructor(public url: string) {
        FakeEventSource.instances.push(this)
    }

    addEventListener(type: string, listener: () => void) {
        this.listeners[type] = listener
    }

    emit(type: string) {
        this.listeners[type]()
    }
}
