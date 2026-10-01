import fs from 'fs'
import path from 'path'

// Color tokens of the UI, mapped to the --color-<token> CSS variables in laazys-app/src/index.css
export const THEME_TOKENS = ['body', 'surface', 'body-text', 'muted', 'line', 'primary', 'accent']
const MODES = ['light', 'dark']

export type Theme = { [mode: string]: { [token: string]: string } }

// '#38f' or '#3388ff' -> '51 136 255' (the format Tailwind's <alpha-value> colors expect)
function hexToRgb(hex: string) {
    const digits = hex.length === 4 ? [...hex.slice(1)].map((digit) => digit + digit) : hex.slice(1).match(/../g)!
    return digits.map((pair) => parseInt(pair, 16)).join(' ')
}

/**
 * Read and validate a theme file:
 * { "light": { "primary": "#3d5589" }, "dark": { "body": "#0f172a" } }
 */
export function loadTheme(file: string): Theme {
    const filePath = path.resolve(process.cwd(), file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const fail = (reason: string) => {
        throw new Error(`Invalid theme ${filePath}: ${reason}`)
    }

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) fail('expected an object')

    const theme: Theme = {}
    for (const [mode, colors] of Object.entries(raw)) {
        if (!MODES.includes(mode)) fail(`unknown mode "${mode}", use ${MODES.join(' or ')}`)
        if (typeof colors !== 'object' || colors === null) fail(`"${mode}" must be an object of colors`)

        theme[mode] = {}
        for (const [token, value] of Object.entries(colors as object)) {
            if (!THEME_TOKENS.includes(token)) fail(`unknown color "${token}", use one of ${THEME_TOKENS.join(', ')}`)
            if (typeof value !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
                fail(`"${mode}.${token}" must be a hex color like #3d5589`)
            }
            theme[mode][token] = hexToRgb(value)
        }
    }

    return theme
}
