import { describe, expect, it } from 'vitest'
import { parseDescription, parseMethod, parseProvide, parseRequires, parseStatus } from '../utils/doc-parser'

describe('single-line tags', () => {
    it('reads the value up to the end of the line', () => {
        const comment = '*\n * @status Deprecated\n * @requires App.vue\n * @provide method|ciao\n '

        expect(parseStatus(comment)).toBe('Deprecated')
        expect(parseRequires(comment)).toBe('App.vue')
        expect(parseProvide(comment)).toBe('method|ciao')
    })

    it('returns null when the tag is missing', () => {
        expect(parseStatus('* @requires App.vue')).toBeNull()
    })
})

describe('parseDescription', () => {
    it('joins a multi-line description and stops at the next tag', () => {
        const comment = '*\n * @description first line\n * second line\n *\n * @status Beta\n '

        expect(parseDescription(comment)).toBe('first line second line')
    })

    it('handles Windows line endings', () => {
        expect(parseDescription('*\r\n * @description one\r\n * two\r\n ')).toBe('one two')
    })
})

describe('parseMethod', () => {
    it('extracts name, description, params and return values', () => {
        const comment = [
            '*',
            ' * @method sum',
            ' * Adds two numbers.',
            ' * @param {number} a - First operand.',
            ' * @param {number} b - Second operand.',
            ' * @returns {number} - The sum.',
            ' ',
        ].join('\n')

        expect(parseMethod(comment)).toEqual({
            name: 'sum',
            description: 'Adds two numbers.',
            params: [
                { name: 'a', type: 'number', description: 'First operand.' },
                { name: 'b', type: 'number', description: 'Second operand.' },
            ],
            return: [{ type: 'number', description: 'The sum.' }],
        })
    })

    it('accepts @return and a return without description', () => {
        expect(parseMethod('* @method noop\n * @return {void}\n').return).toEqual([{ type: 'void', description: '' }])
    })

    it('falls back to empty values when parts are missing', () => {
        expect(parseMethod('* @param {string} x - unused')).toEqual({
            name: null,
            description: '',
            params: [{ name: 'x', type: 'string', description: 'unused' }],
            return: [],
        })
    })
})
