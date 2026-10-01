import { describe, expect, it } from 'vitest'
import laazys from '../index'
import { getAllFiles } from '../utils/get-all-files'
import { getDocumentation } from '../utils/get-documentations'

describe('package entry point', () => {
    it('exposes the parsing functions', () => {
        expect(laazys).toEqual({ getAllFiles, getDocumentation })
    })
})
