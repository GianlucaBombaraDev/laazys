import figlet from 'figlet'
import chalk from 'chalk'
import yargs from 'yargs/yargs'
import path from 'path'
import { fileURLToPath } from 'url'
import open from 'open'
import { getDocumentation } from './get-documentations'
import { DocsState, createApp, startServer } from './server'
import { loadTheme } from './theme'
import { watchFolder } from './watch'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Compiled to dist/utils/cli.js, so this resolves to packages/laazys/app
export const DEFAULT_APP_DIR = path.join(__dirname, '../../app')
export const DEFAULT_PORT = 3000

const highlight = (text: string | number) => chalk.hex('#9CEE8D').bold(`${text}`)

export async function run(args: string[], { appDir = DEFAULT_APP_DIR, port = DEFAULT_PORT } = {}) {
    console.log(
        chalk.hex('#9CEE8D').bold(
            figlet.textSync('L a a z y s', {
                horizontalLayout: 'default',
                verticalLayout: 'default',
                width: 80,
                whitespaceBreak: true,
            }),
        ),
    )

    const argv = await yargs(args)
        .options({
            path: {
                alias: 'p',
                describe: 'Folder to document (.vue, .js and .ts files)',
                type: 'string',
                demandOption: true,
            },
            open: {
                alias: 'o',
                describe: 'Open the docs in the browser',
                type: 'string',
                demandOption: false,
            },
            watch: {
                alias: 'w',
                describe: 'Regenerate the docs when files change',
                type: 'boolean',
                default: false,
            },
            theme: {
                alias: 't',
                describe: 'JSON file with custom colors for the light and dark themes',
                type: 'string',
            },
        })
        .parseAsync()

    // Validate the theme before the slow parsing step, so a typo fails fast
    const theme = argv.theme ? loadTheme(argv.theme) : {}

    console.log(`\nWe are analyzing the files inside: ${highlight(argv.path)}`)

    const state = new DocsState(await getDocumentation(argv.path))

    console.log(`\nAnalyzed ${highlight(state.files.length)} file`)
    console.log()

    const { server, port: actualPort } = await startServer(createApp(state, appDir, theme), port)
    const url = `http://localhost:${actualPort}`

    console.log(`Server is running at ${highlight(url)}`)

    if (argv.watch) {
        const stop = watchFolder(path.resolve(process.cwd(), argv.path), async () => {
            try {
                state.update(await getDocumentation(argv.path))
                console.log(`Docs updated: ${highlight(state.files.length)} file`)
            } catch (error) {
                // e.g. the folder was removed: keep serving the last good docs
                console.error(error)
            }
        })
        server.on('close', stop)
        console.log('Watching for changes...')
    }

    // `-o` without a value parses as '', so only a missing flag counts as "don't open"
    if (argv.open !== undefined) await open(url)

    return server
}
