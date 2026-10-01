#!/usr/bin/env node
import { hideBin } from 'yargs/helpers'
import { run } from '../utils/cli'

run(hideBin(process.argv)).catch((error) => {
    console.error(error)
    process.exit(1)
})
