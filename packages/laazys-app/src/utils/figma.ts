/**
 * Only https links on figma.com are used: the value comes from a JSDoc comment, and anything else
 * (e.g. a javascript: URL) must never become a link or an iframe.
 */
export function isFigmaUrl(value: string) {
    try {
        const url = new URL(value)
        return url.protocol === 'https:' && (url.hostname === 'figma.com' || url.hostname.endsWith('.figma.com'))
    } catch {
        return false
    }
}

export const figmaEmbedUrl = (url: string) =>
    `https://www.figma.com/embed?embed_host=laazys&url=${encodeURIComponent(url)}`
