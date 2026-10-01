import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { extractFileInfo, generateRandomHash, getAllFiles } from '../utils/get-all-files'

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
        expect(result.js).toHaveLength(1)
    })

    it('documents the @method blocks of .js files', () => {
        const [composable] = getAllFiles(root).js

        expect(composable).toMatchObject({
            path: path.join(root, 'nested', 'useCard.js'),
            name: 'useCard',
            extension: 'js',
            methods: [{ name: 'useCard', description: '', params: [], return: [] }],
        })
        expect(composable.id).toMatch(/^[0-9a-f]+$/)
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
