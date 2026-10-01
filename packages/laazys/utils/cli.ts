import figlet from 'figlet'
import chalk from 'chalk'
import yargs from 'yargs/yargs'
import path from 'path'
import { fileURLToPath } from 'url'
import open from 'open'
import { getDocumentation } from './get-documentations'
import { createApp, startServer } from './server'

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
                describe: 'The path to process vue file',
                type: 'string',
                demandOption: true,
            },
            open: {
                alias: 'o',
                describe: 'open dev server',
                type: 'string',
                demandOption: false,
            },
        })
        .parseAsync()

    console.log(`\nWe are analyzing the files inside: ${highlight(argv.path)}`)

    const filesList = await getDocumentation(argv.path)

    console.log(`\nAnalyzed ${highlight(filesList.length)} file`)
    console.log()

    const { server, port: actualPort } = await startServer(createApp(filesList, appDir), port)
    const url = `http://localhost:${actualPort}`

    console.log(`Server is running at ${highlight(url)}`)

    // `-o` without a value parses as '', so only a missing flag counts as "don't open"
    if (argv.open !== undefined) await open(url)

    return server
}
