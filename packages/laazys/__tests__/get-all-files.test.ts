import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { extractFileInfo, generateRandomHash, getAllFiles, isDocumentable, isIgnoredDir } from '../utils/get-all-files'

let root: string

const write = (relativePath: string, content: string) => {
    const filePath = path.join(root, relativePath)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content)
}

beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'laazys-walk-'))
    write('Button.vue', '<template><button /></template>')
    write('nested/deep/Card.vue', '<template><div /></template>')
    write('nested/useCard.js', '/**\n * @method useCard\n */\nexport function useCard() {}\n')
    write('nested/useTyped.ts', '/**\n * @method useTyped\n */\nexport function useTyped(): void {}\n')
    write('nested/plain.js', 'export const SIZE = 3\n')
    write('nested/types.d.ts', '/**\n * @method declared\n */\nexport declare function declared(): void\n')
    write('notes.md', '# not documented')
    write('node_modules/lib/Ignored.vue', '<template />')
    write('dist/Ignored.vue', '<template />')
    write('.cache/Ignored.vue', '<template />')
})

afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true })
})

describe('getAllFiles', () => {
    it('collects .vue and .js files recursively, skipping ignored folders', () => {
        const result = getAllFiles(root)

        expect(result.paths.map((p: string) => path.relative(root, p)).sort()).toEqual([
            'Button.vue',
            path.join('nested', 'deep', 'Card.vue'),
        ])
        expect(result.files.map((f: any) => f.file).sort()).toEqual([
            '<template><button /></template>',
            '<template><div /></template>',
        ])
        // plain.js has no @method block and types.d.ts is a declaration file
        expect(result.js.map((file: any) => file.name).sort()).toEqual(['useCard', 'useTyped'])
    })

    it('documents TypeScript composables like JavaScript ones', () => {
        const typed = getAllFiles(root).js.find((file: any) => file.name === 'useTyped')

        expect(typed).toMatchObject({ extension: 'ts', methods: [{ name: 'useTyped' }] })
    })

    it('documents the @method blocks of .js files', () => {
        const composable = getAllFiles(root).js.find((file: any) => file.name === 'useCard')

        expect(composable).toMatchObject({
            path: path.join(root, 'nested', 'useCard.js'),
            name: 'useCard',
            extension: 'js',
            methods: [{ name: 'useCard', description: '', params: [], return: [] }],
        })
        expect(composable.id).toMatch(/^[0-9a-f]+$/)
    })
})

describe('file filters', () => {
    it.each([
        ['Button.vue', true],
        ['useCard.js', true],
        ['useCard.ts', true],
        ['types.d.ts', false],
        ['styles.css', false],
    ])('isDocumentable(%s) is %s', (file, expected) => {
        expect(isDocumentable(file)).toBe(expected)
    })

    it.each([
        ['node_modules', true],
        ['dist', true],
        ['.git', true],
        ['components', false],
    ])('isIgnoredDir(%s) is %s', (dir, expected) => {
        expect(isIgnoredDir(dir)).toBe(expected)
    })
})

describe('extractFileInfo', () => {
    it('returns the bare name and extension of a POSIX path', () => {
        expect(extractFileInfo('/home/me/src/Button.vue')).toEqual({ name: 'Button', extension: 'vue' })
    })

    it('returns the bare name and extension of a Windows path', () => {
        expect(extractFileInfo('C:\\project\\src\\useCard.js')).toEqual({ name: 'useCard', extension: 'js' })
    })
})

describe('generateRandomHash', () => {
    it('returns a hexadecimal string', () => {
        expect(generateRandomHash()).toMatch(/^[0-9a-f]+$/)
    })
})
