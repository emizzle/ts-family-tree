#!/usr/bin/env node

/**
 * ts-family-tree
 * Geektrust fam
 */

import { Command } from 'commander'
import { isErr, isOk, Result } from 'rustic'
import {
  Action,
  AddChildCommand,
  AddInlawCommand,
  GetRelationshipCommand,
} from './common'
import { parseInput } from './parser'
import Tree from './tree'

const program = new Command()
program.option('-i, --input-path <path>', 'input file path', './static/input.txt')
program.parse(process.argv)
const tree = new Tree()
parseInput(program.opts()['inputPath']).then((inputCmds) => {
  for (const inputCmd of inputCmds) {
    let result = ''
    switch (inputCmd.action) {
      case Action.ADD_CHILD:
        const addChildCmd = <AddChildCommand>inputCmd
        const addChildResult = tree.addChild(
          addChildCmd.mothersName,
          addChildCmd.childsName,
          addChildCmd.gender,
        )
        if (isOk(addChildResult)) {
          result = 'CHILD_ADDED'
        } else {
          result = addChildResult.data
        }
        break
      case Action.ADD_INLAW:
        let addInlawCmd = <AddInlawCommand>inputCmd
        const addInlawResult = tree.addInlaw(
          addInlawCmd.mothersName,
          addInlawCmd.childsName,
          addInlawCmd.spousesName,
          addInlawCmd.gender,
        )
        if (isOk(addInlawResult)) {
          result = 'INLAW_ADDED'
        } else {
          result = addInlawResult.data
        }
        break
      case Action.GET_RELATIONSHIP:
        let getRelCmd = <GetRelationshipCommand>inputCmd
        const getRelResult = tree.query(getRelCmd.name, getRelCmd.relationship)
        if (isOk(getRelResult)) {
          if (getRelResult.data.length === 0) {
            result = 'NONE'
          } else {
            result = getRelResult.data.map((p) => p.name).join(' ')
          }
        } else {
          result = getRelResult.data
        }
        break
    }
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
