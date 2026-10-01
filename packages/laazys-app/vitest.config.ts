import { defineProject } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineProject({
    plugins: [vue()],
    test: {
        name: 'laazys-app',
        environment: 'happy-dom',
        include: ['__tests__/**/*.test.ts'],
    },
})
