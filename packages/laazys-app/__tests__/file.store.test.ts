import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFileStore } from '../src/store/file.store'

beforeEach(() => {
    setActivePinia(createPinia())
})

describe('file store', () => {
    it('returns null while the files are not loaded', () => {
        expect(useFileStore().getCurrentFile('a')).toBeNull()
    })

    it('finds a file by id', () => {
        const store = useFileStore()
        store.files = [{ id: 'a' }, { id: 'b' }]

        expect(store.getCurrentFile('b')).toEqual({ id: 'b' })
        expect(store.getCurrentFile('missing')).toBeNull()
    })
})
