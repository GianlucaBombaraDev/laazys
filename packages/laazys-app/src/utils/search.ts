import type { File } from '../types/file.type'

const names = (items?: { name: string | null }[]) => (items ?? []).map((item) => item.name)

/** Case-insensitive match on the name, description and API of each file */
export function searchFiles(files: File[], query: string) {
    const needle = query.trim().toLowerCase()
    if (!needle) return files

    return files.filter((file) =>
        [
            file.name,
            file.description,
            ...names(file.props),
            ...names(file.events),
            ...names(file.slots),
            ...names(file.methods),
        ]
            // Unnamed @method blocks and missing descriptions have no text to match
            .filter((text): text is string => typeof text === 'string')
            .some((text) => text.toLowerCase().includes(needle)),
    )
}
