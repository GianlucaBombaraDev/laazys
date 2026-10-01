import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vitest from '@vitest/eslint-plugin'
import prettier from 'eslint-config-prettier/flat'

export default tseslint.config(
    {
        // test/ holds sample files to document, not real code
        ignores: [
            '**/node_modules/',
            '**/dist/',
            '**/coverage/',
            'packages/laazys/app/',
            'packages/laazys/test/',
            '**/__tests__/fixtures/',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: { parser: tseslint.parser },
        },
    },
    {
        languageOptions: {
            globals: { ...globals.node, ...globals.browser },
        },
        rules: {
            'vue/multi-word-component-names': 0,
            // The codebase relies on loosely typed parser output
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/ban-ts-comment': 0,
        },
    },
    {
        files: ['**/__tests__/**/*.ts'],
        plugins: { vitest },
        rules: vitest.configs.recommended.rules,
    },
    prettier,
)
