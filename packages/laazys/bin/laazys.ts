import figlet from 'figlet'
import chalk from 'chalk'
import fs from 'fs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDocumentation } from '../utils/get-documentations'
import open from 'open'

async function start() {
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

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const argv = yargs(hideBin(process.argv)).options({
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
    }).argv

    // @ts-ignore
    const filesList = await getDocumentation(argv?.path ? argv.path : './lib')

    console.log(`\nAnalizzati: ${filesList.length} file`)

    const jsonString = JSON.stringify(filesList, null, 2)

    // Write JSON string to a file
    fs.writeFile('../laazys-app/dist/api/files.json', jsonString, (err) => {
        if (err) {
            console.error('Error writing JSON file:', err)
            return
        }
    })

    // @ts-ignore
    if (argv?.open) {
        const app = express()
        const port = 3000

        function startServer(port: number) {
            app.listen(port, () => {
                console.log(`Server is running at http://localhost:${port}`)
                open(`http://localhost:${port}`)
            }).on('error', (err) => {
                // @ts-ignore
                if (err.code === 'EADDRINUSE') {
                    console.warn(`Port ${port} is already in use, trying port ${port + 1}`)
                    startServer(++port)
                } else {
                    console.error(err)
                }
            })
        }

        // Serve static files from the "public" directory
        app.use(express.static(path.join(__dirname, '../../../laazys-app/dist')))

        // Route for serving the HTML file
        // @ts-ignore
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../../laazys-app/dist/index.html'))
        })

        startServer(port)
    }
}

start().catch((error) => {
    console.error(error)
    process.exit(1)
})
