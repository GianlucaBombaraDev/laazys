import figlet from 'figlet'
import chalk from 'chalk'
import fs from 'fs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { getDocumentation } from '../utils/get-documentations'

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

    const argv = yargs(hideBin(process.argv)).options({
        path: {
            alias: 'p',
            describe: 'The path to process vue file',
            type: 'string',
            demandOption: true,
        },
    }).argv

    // @ts-ignore
    const filesList = await getDocumentation(argv?.path ? argv.path : './lib')

    const jsonString = JSON.stringify(filesList, null, 2)

    // Write JSON string to a file
    fs.writeFile('./public/files.json', jsonString, (err) => {
        if (err) {
            console.error('Error writing JSON file:', err)
            return
        }
    })
}

start().catch((error) => {
    console.error(error)
    process.exit(1)
})
