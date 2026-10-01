import path from 'path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getDocumentation } from '../utils/get-documentations'

const FIXTURES = path.join(__dirname, 'fixtures', 'docs')

let list: any[]
let parseErrors: unknown[][]

const byName = (name: string) => list.find((file) => file.name === name)

beforeAll(async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    list = await getDocumentation(path.relative(process.cwd(), FIXTURES))
    // Copied now: Vitest clears mock calls before each test
    parseErrors = [...consoleError.mock.calls]
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe('getDocumentation', () => {
    it('documents every parsable file and skips the ones that fail', () => {
        expect(list.map((file) => file.name).sort()).toEqual([
            'Empty',
            'Full',
            'OnlyEvents',
            'OnlySlots',
            'PublicMethod',
            'useThing',
            'useTyped',
        ])
        // Broken.vue is reported, not fatal
        expect(parseErrors).toHaveLength(1)
    })

    it('lists components before composables', () => {
        const extensions = list.map((file) => file.extension)
        const firstComposable = extensions.findIndex((extension) => extension !== 'vue')

        expect(extensions.slice(0, firstComposable).every((extension) => extension === 'vue')).toBe(true)
        expect(extensions.slice(firstComposable).sort()).toEqual(['js', 'ts'])
    })

    it('accepts an absolute path', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const absolute = await getDocumentation(FIXTURES)

        expect(absolute.map((file) => file.name).sort()).toEqual(list.map((file) => file.name).sort())
    })

    it('reads the custom tags and the vue-docgen data of a component', () => {
        const full = byName('Full')

        expect(full).toMatchObject({
            path: path.join(FIXTURES, 'Full.vue'),
            extension: 'vue',
            description: 'A component documented with every supported tag, on two lines.',
            status: 'Beta',
            requires: 'Parent.vue',
            provide: 'panel|open',
            props: [{ name: 'isActive', type: { name: 'boolean' } }],
            events: [{ name: 'update' }],
            slots: [{ name: 'default' }],
        })
        expect(full.code).toContain('defineProps')
        expect(full.id).toMatch(/^[0-9a-f]+$/)
    })

    it('keeps every @method block of a component', () => {
        expect(byName('Full').methods).toEqual([
            {
                name: 'open',
                description: 'Opens the panel.',
                params: [{ name: 'title', type: 'string', description: 'The panel title.' }],
                return: [{ type: 'boolean', description: 'Whether it opened.' }],
            },
            { name: 'close', description: 'Closes the panel.', params: [], return: [] },
        ])
    })

    it('keeps the methods found by vue-docgen', () => {
        expect(byName('PublicMethod').methods).toEqual([expect.objectContaining({ name: 'reset' })])
        expect(byName('Empty').methods).toBeUndefined()
    })

    it('generates a usage snippet from props, events and slots', () => {
        expect(byName('Full').sourceCode).toBe(
            '<Full :isActive="" @update="() => {}"><slot name="default"></slot></Full>\n',
        )
        expect(byName('OnlyEvents').sourceCode).toBe('<OnlyEvents @close="() => {}" />\n')
        expect(byName('OnlySlots').sourceCode).toBe('<OnlySlots><slot name="header"></slot></OnlySlots>\n')
    })

    it('skips the snippet when there is nothing to show', () => {
        expect(byName('Empty').sourceCode).toBeUndefined()
    })

    it('documents composables with the same method shape', () => {
        expect(byName('useThing').methods).toEqual([
            {
                name: 'useThing',
                description: 'Shared state helper. Creates the thing.',
                params: [{ name: 'size', type: 'number', description: 'Initial size.' }],
                return: [{ type: 'object', description: 'The thing.' }],
            },
            { name: 'helper', description: '', params: [], return: [{ type: 'string', description: '' }] },
        ])
    })

    it('documents TypeScript composables and skips declarations and plain modules', () => {
        expect(byName('useTyped')).toMatchObject({
            extension: 'ts',
            methods: [{ name: 'useTyped', params: [{ name: 'label', type: 'string' }], return: [{ type: 'number' }] }],
        })
        expect(byName('types')).toBeUndefined()
        expect(byName('constants')).toBeUndefined()
    })
})
