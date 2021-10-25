#!/usr/bin/env node

/**
 * ts-family-tree
 * Geektrust fam
 */

import { Command } from 'commander'
import { parseInput } from './parser'
import Tree from './tree'

const program = new Command()
program.option('-i, --input-path <path>', 'input file path', './static/input.txt')
program.parse(process.argv)
const tree = new Tree()
parseInput(program.opts()['inputPath']).then((inputCmds) => {
  for (const inputCmd of inputCmds) {
    let result = ''
    // get query result

    // or
    // perform tree manipulation
    result = tree.manipulate(inputCmd) as string
    console.log(`Action: ${JSON.stringify(inputCmd)}`)
    console.log(`Result: ${result}`)
  }
  console.log(`Tree after action: ${tree.toString()}`)
})
/**
 * TODO: document
 */

// Local Variables:
// mode: typescript
// End:
