import { describe, expect, it } from 'vitest'
import { figmaEmbedUrl, isFigmaUrl } from '../src/utils/figma'

describe('isFigmaUrl', () => {
    it.each([
        ['https://www.figma.com/design/abc/Panel?node-id=1-2', true],
        ['https://figma.com/file/abc', true],
        ['http://www.figma.com/design/abc', false],
        ['https://figma.com.evil.example/design', false],
        ['https://notfigma.com/design', false],
        ['javascript:alert(1)', false],
        ['not a url', false],
    ])('%s -> %s', (url, expected) => {
        expect(isFigmaUrl(url)).toBe(expected)
    })
})

describe('figmaEmbedUrl', () => {
    it('wraps the link in the Figma embed URL', () => {
        expect(figmaEmbedUrl('https://www.figma.com/design/abc?node-id=1-2')).toBe(
            'https://www.figma.com/embed?embed_host=laazys&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fabc%3Fnode-id%3D1-2',
        )
    })
})
