import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { THEME_TOKENS, loadTheme } from '../utils/theme'

let dir: string
const themeFile = (content: unknown) => {
    const file = path.join(dir, `theme-${Math.random()}.json`)
    fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content))
    return file
}

beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'laazys-theme-'))
})

afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true })
})

describe('loadTheme', () => {
    it('converts hex colors to the RGB triplets used by the CSS variables', () => {
        const file = themeFile({ light: { primary: '#3d5589', accent: '#FFF' }, dark: { 'body-text': '#000000' } })

        expect(loadTheme(file)).toEqual({
            light: { primary: '61 85 137', accent: '255 255 255' },
            dark: { 'body-text': '0 0 0' },
        })
    })

    it('resolves the path from the current directory', () => {
        const file = themeFile({ dark: {} })

        expect(loadTheme(path.relative(process.cwd(), file))).toEqual({ dark: {} })
    })

    it('knows every token of the UI', () => {
        expect(THEME_TOKENS).toEqual(['body', 'surface', 'body-text', 'muted', 'line', 'primary', 'accent'])
    })

    it.each([
        ['an array', [], 'expected an object'],
        ['null', 'null', 'expected an object'],
        ['an unknown mode', { sepia: {} }, 'unknown mode "sepia"'],
        ['a mode that is not an object', { dark: '#000' }, '"dark" must be an object of colors'],
        ['a null mode', { dark: null }, '"dark" must be an object of colors'],
        ['an unknown token', { dark: { background: '#000' } }, 'unknown color "background"'],
        ['a color that is not a string', { dark: { body: 0 } }, '"dark.body" must be a hex color'],
        ['a color that is not hex', { dark: { body: 'red' } }, '"dark.body" must be a hex color'],
    ])('rejects %s', (label, content, message) => {
        expect(() => loadTheme(themeFile(content))).toThrow(message)
    })

    it('reports invalid JSON', () => {
        expect(() => loadTheme(themeFile('{ nope'))).toThrow(SyntaxError)
    })
})
