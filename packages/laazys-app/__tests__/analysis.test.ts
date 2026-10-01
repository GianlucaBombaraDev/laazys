import { describe, expect, it } from 'vitest'
import { analyzeFiles } from '../src/utils/analysis'

const files: any[] = [
    { id: 'a', name: 'Old', extension: 'vue', status: 'Deprecated', description: 'Legacy button' },
    { id: 'b', name: 'New', extension: 'vue', status: 'beta' },
    { id: 'c', name: 'Plain', extension: 'vue', methods: [{ name: 'open', description: 'Opens it' }] },
    { id: 'd', name: 'Draft', extension: 'vue', status: 'BETA', description: 'WIP' },
    {
        id: 'e',
        name: 'useCounter',
        extension: 'ts',
        methods: [{ name: 'increment', description: '' }, { name: 'reset' }, { name: 'set', description: 'Sets it' }],
    },
    { id: 'f', name: 'useLegacy', extension: 'js' },
]

describe('analyzeFiles', () => {
    const analysis = analyzeFiles(files)

    it('counts components and composables', () => {
        expect(analysis.components).toBe(4)
        expect(analysis.composables).toBe(2)
    })

    it('groups components by status, case-insensitively', () => {
        expect(analysis.statusCounts).toEqual({ deprecated: 1, beta: 2, 'senza stato': 1 })
    })

    it('lists deprecated components', () => {
        expect(analysis.deprecated).toEqual([{ id: 'a', label: 'Old' }])
    })

    it('lists components without a description', () => {
        expect(analysis.missingDescription).toEqual([
            { id: 'b', label: 'New' },
            { id: 'c', label: 'Plain' },
        ])
    })

    it('lists methods without a description with their file', () => {
        expect(analysis.undocumentedMethods).toEqual([
            { id: 'e', label: 'increment()', detail: 'useCounter' },
            { id: 'e', label: 'reset()', detail: 'useCounter' },
        ])
    })

    it('handles an empty project', () => {
        expect(analyzeFiles([])).toEqual({
            components: 0,
            composables: 0,
            statusCounts: {},
            deprecated: [],
            missingDescription: [],
            undocumentedMethods: [],
        })
    })
})
