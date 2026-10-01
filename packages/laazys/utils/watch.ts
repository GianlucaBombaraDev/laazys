import fs from 'fs'
import path from 'path'
import { isDocumentable, isIgnoredDir } from './get-all-files'

/**
 * Call `onChange` once a burst of changes to documentable files settles.
 * Returns a function that stops watching.
 */
export function watchFolder(dir: string, onChange: () => void, delay = 200) {
    let timer: NodeJS.Timeout | undefined

    const watcher = fs.watch(dir, { recursive: true }, (event, filename) => {
        // filename is relative to dir; it can be missing on some platforms
        if (!filename || !isDocumentable(filename)) return
        // Folder segments only: path.dirname would give '.' for top-level files
        if (filename.split(path.sep).slice(0, -1).some(isIgnoredDir)) return

        clearTimeout(timer)
        timer = setTimeout(onChange, delay)
    })

    return () => {
        clearTimeout(timer)
        watcher.close()
    }
}
