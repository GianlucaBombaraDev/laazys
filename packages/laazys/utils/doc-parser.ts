const _parseSingleLine = (tag: string) => new RegExp(`@${tag} ([^\\r\\n]+)`)
const _parseMultiLine = (tag: string) => new RegExp(`@${tag}\\s*([^@]*)`, 'i')

const _matchTag = (regex: any, input: string) => {
    const match = input.match(regex)
    return match ? match[1].replace(/ *\r?\n *\* */g, ' ').trim() : null
}

export const parseRequires = (text: string) => _matchTag(_parseSingleLine('requires'), text)
export const parseStatus = (text: string) => _matchTag(_parseSingleLine('status'), text)
export const parseDescription = (text: string) => _matchTag(_parseMultiLine('description'), text)
export const parseMethod = (text: string) => {
    const methodMatch = text.match(/@method\s+([^\n\r]+)\s*/)
    const descriptionMatch = text.match(/@method[^\n\r]+\n\s*\*\s*([^\n\r@]+)\s*/)
    const paramMatches = [...text.matchAll(/@param\s+\{([^}]+)\}\s+(\w+)\s+-\s+([^\n\r]+)/g)]
    // Adjusted to ensure it captures scenarios where the description might follow different newline conventions
    const returnMatch = [...text.matchAll(/@returns?\s+\{([^}]+)\}[ \t]*([^\n\r]*)/g)]

    const documentation: any = {
        name: methodMatch ? methodMatch[1].trim() : null,
        description: descriptionMatch ? descriptionMatch[1].trim().replace(/ *\r?\n *\* */g, ' ') : '',
        params: [],
        return: null,
    }

    // Parsing parameters
    documentation.params = paramMatches.map((match) => ({
        name: match[2],
        type: match[1],
        description: match[3].trim(),
    }))

    // Parsing return
    documentation.return = returnMatch.map((match) => ({
        type: match[1],
        description: match[2].replace(/^-\s*/, '').trim(),
    }))

    return documentation
}
export const parseProvide = (text: string) => _matchTag(_parseSingleLine('provide'), text)
export const parseFigma = (text: string) => _matchTag(_parseSingleLine('figma'), text)

/** `@previewProps {"label": "Save"}`: props used to render the component preview */
export const parsePreviewProps = (text: string) => {
    const json = _matchTag(_parseSingleLine('previewProps'), text)
    try {
        const props = JSON.parse(json as string)
        if (typeof props === 'object' && props !== null && !Array.isArray(props)) return props
        console.warn(`@previewProps must be a JSON object, got: ${json}`)
    } catch {
        console.warn(`@previewProps is not valid JSON: ${json}`)
    }
    return null
}
