import { describe, expect, it } from 'vitest'
import { searchFiles } from '../src/utils/search'

const files: any[] = [
    {
        id: 'a',
        name: 'SubmitButton',
        extension: 'vue',
        description: 'Sends the form',
        props: [{ name: 'disabled' }],
        events: [{ name: 'submit' }],
        slots: [{ name: 'icon' }],
    },
    { id: 'b', name: 'useCounter', extension: 'ts', methods: [{ name: 'increment' }, { name: null }] },
]
const ids = (query: string) => searchFiles(files, query).map((file) => file.id)

describe('searchFiles', () => {
    it.each(['', '   '])('returns every file for the empty query %j', (query) => {
        expect(searchFiles(files, query)).toBe(files)
    })

    it.each([
        ['name', 'submitbutton', ['a']],
        ['description', 'FORM', ['a']],
        ['prop', 'disab', ['a']],
        ['event', 'submit', ['a']],
        ['slot', 'icon', ['a']],
        ['method', 'increment', ['b']],
        ['nothing', 'zzz', []],
    ])('matches by %s', (label, query, expected) => {
        expect(ids(query)).toEqual(expected)
    })

    it('trims the query and matches partial text in any file', () => {
        expect(ids('  u ')).toEqual(['a', 'b'])
    })
})
