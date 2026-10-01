import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent } from 'vue'

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
