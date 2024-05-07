/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}', './src/*.{js,ts,jsx,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                body: 'rgb(var(--color-body) / <alpha-value>)',
                bodyText: 'rgb(var(--color-body-text) / <alpha-value>)',
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                accent: 'rgb(var(--color-accent) / <alpha-value>)',
                warning: {
                    text: 'rgb(var(--color-warning-text) / <alpha-value>)',
                    bg: 'rgb(var(--color-warning-bg) / <alpha-value>)',
                },
                success: {
                    text: 'rgb(var(--color-success-text) / <alpha-value>)',
                    bg: 'rgb(var(--color-success-bg) / <alpha-value>)',
                },
                beta: {
                    text: 'rgb(var(--color-beta-text) / <alpha-value>)',
                    bg: 'rgb(var(--color-beta-bg) / <alpha-value>)',
                },
                preAlpha: {
                    text: 'rgb(var(--color-preAlpha-text) / <alpha-value>)',
                    bg: 'rgb(var(--color-preAlpha-bg) / <alpha-value>)',
                },
                alpha: {
                    text: 'rgb(var(--color-alpha-text) / <alpha-value>)',
                    bg: 'rgb(var(--color-alpha-bg) / <alpha-value>)',
                },
                deprecated: {
                    text: 'rgb(var(--color-deprecated-text) / <alpha-value>)',
                    bg: 'rgb(var(--color-deprecated-bg) / <alpha-value>)',
                },
            },
        },
    },
    plugins: [],
}
