import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    parseDescription,
    parseFigma,
    parseMethod,
    parsePreviewProps,
    parseProvide,
    parseRequires,
    parseStatus,
} from '../utils/doc-parser'

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

describe('parseFigma', () => {
    it('reads the design link', () => {
        expect(parseFigma('* @figma https://www.figma.com/design/abc/Panel?node-id=1-2\n')).toBe(
            'https://www.figma.com/design/abc/Panel?node-id=1-2',
        )
    })
})

describe('parsePreviewProps', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('parses a JSON object', () => {
        expect(parsePreviewProps('* @previewProps {"label": "Save", "count": 2}\n')).toEqual({
            label: 'Save',
            count: 2,
        })
    })

    it.each([
        ['invalid JSON', '* @previewProps {label: Save}', '@previewProps is not valid JSON: {label: Save}'],
        ['an array', '* @previewProps [1, 2]', '@previewProps must be a JSON object, got: [1, 2]'],
        ['null', '* @previewProps null', '@previewProps must be a JSON object, got: null'],
    ])('warns and ignores %s', (label, comment, warning) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        expect(parsePreviewProps(comment)).toBeNull()
        expect(warn).toHaveBeenCalledWith(warning)
    })
})
