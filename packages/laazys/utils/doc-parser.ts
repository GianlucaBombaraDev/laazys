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
    const paramMatches = [...text.matchAll(/@param\s+\{([^\}]+)\}\s+(\w+)\s+-\s+([^\n\r]+)/g)]
    // Adjusted to ensure it captures scenarios where the description might follow different newline conventions
    const returnMatch = [...text.matchAll(/@return\s+\{([^\}]+)\}\s+(\w+)\s+-\s+([^\n\r]+)/g)]

    let documentation: any = {
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
    if (returnMatch) {
        documentation.return = returnMatch.map((match) => ({
            type: match[1],
            description: match[3].trim(),
        }))
    }

    return documentation
}
export const parseProvide = (text: string) => _matchTag(_parseSingleLine('provide'), text)
