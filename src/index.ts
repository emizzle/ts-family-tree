#!/usr/bin/env node

/**
 * ts-family-tree
 * Geektrust fam
 */

import { Command } from 'commander'
import { isErr, Result } from 'rustic'
import { Person, QueryError, UpdateError, UpdateResult } from './common'
import { ParsedCommands, ParseError, parseInput } from './parser'
import Tree from './tree/tree'
import TreeQuerierFactory from './tree/querier/factory'
import TreeUpdaterFactory from './tree/updater/factory'

const program = new Command()
program.option('-i, --input-path <path>', 'input file path', './static/input.txt')
program.parse(process.argv)

function logOutput(output: string | undefined) {
  if (output !== undefined) {
    console.log(output)
  }
}
function logError(error: string | undefined) {
  if (error !== undefined) {
    console.error(error)
  }
}
parseInput(program.opts()['inputPath']).then((result) => {
  if (isErr(result)) {
    // TODO: replace .toString with applicable error translation from
    // layer below
    logOutput(ParseError[result.data])
  }
  const { updateCmds, queryCmds } = <ParsedCommands>result.data
  const tree = new Tree()
  const updaterFactory = new TreeUpdaterFactory(tree)
  const querierFactory = new TreeQuerierFactory(tree)
  for (const updateCmd of updateCmds) {
    // TODO: remove me
    logOutput(`Action: ${updateCmd.toString()}`)
    const result = updaterFactory.update(updateCmd)
    if (isErr(result)) {
      logError(UpdateError[result.data])
    }
    logOutput(UpdateResult[result.data])
  }
  // TODO: remove me
  logOutput(`Tree after updates: ${tree.toString()}`)

  for (const queryCmd of queryCmds) {
    // TODO: remove me
    logOutput(`Query: ${queryCmd.toString()}`)

    const getRelResult: Result<Person[], QueryError> = querierFactory.query(queryCmd)
    if (isErr(getRelResult)) {
      // TODO: replace .toString with applicable error translation from
      // layer below
      logOutput(QueryError[getRelResult.data])
      continue
    }
    // query success
    let people = getRelResult.data
    logOutput(people.length ? people.map((p) => p.name).join(' ') : 'NONE')
  }
})
/**
 * TODO: document
 */

// Local Variables:
// mode: typescript
// End:
