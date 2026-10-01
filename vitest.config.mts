import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        projects: ['packages/laazys', 'packages/laazys-app'],
        coverage: {
            provider: 'v8',
            // Relative to the repo root. Run coverage on the whole suite: with --project the
            // patterns resolve differently and nothing is collected.
            include: [
                'packages/laazys/index.ts',
                'packages/laazys/bin/**/*.ts',
                'packages/laazys/utils/**/*.ts',
                'packages/laazys-app/src/**',
            ],
            exclude: ['**/*.d.ts'],
            reporter: ['text', 'html', 'lcov'],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
})
