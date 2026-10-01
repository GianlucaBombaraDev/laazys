import { defineProject } from 'vitest/config'

export default defineProject({
    test: {
        name: 'laazys',
        environment: 'node',
        include: ['__tests__/**/*.test.ts'],
    },
})
