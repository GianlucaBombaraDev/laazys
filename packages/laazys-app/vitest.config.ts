import { defineProject } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineProject({
    plugins: [vue()],
    test: {
        name: 'laazys-app',
        environment: 'happy-dom',
        // Never load iframe pages (component preview, Figma embed): tests must not hit the network
        environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true } } },
        include: ['__tests__/**/*.test.ts'],
    },
})
