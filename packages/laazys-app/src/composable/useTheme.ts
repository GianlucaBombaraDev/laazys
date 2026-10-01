const STORAGE_KEY = 'laazys-theme'
const STYLE_ID = 'laazys-custom-theme'

export type Theme = { light?: Record<string, string>; dark?: Record<string, string> }

/** Saved choice first, then the operating system preference */
export function getInitialDark(): boolean {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return saved === 'dark'
    } catch {
        // Storage can be blocked (private mode, disabled site data): fall back to the system
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function setDarkClass(dark: boolean) {
    document.body.classList.toggle('dark-theme', dark)
}

export function saveTheme(dark: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
        // Not persisted: the choice still applies to this page
    }
}

/**
 * Apply the colors passed with `laazys --theme`. The CLI has already validated them and
 * converted them to "R G B" triplets. Unlayered rules win over the defaults in index.css.
 */
export function applyCustomTheme(theme: Theme) {
    const css = Object.entries(theme)
        .map(([mode, colors]) => {
            const selector = mode === 'dark' ? 'body.dark-theme' : ':root'
            const variables = Object.entries(colors)
                .map(([token, rgb]) => `--color-${token}: ${rgb};`)
                .join(' ')
            return `${selector} { ${variables} }`
        })
        .join('\n')

    let style = document.getElementById(STYLE_ID)
    if (!style) {
        style = document.createElement('style')
        style.id = STYLE_ID
        document.head.appendChild(style)
    }
    style.textContent = css
}
