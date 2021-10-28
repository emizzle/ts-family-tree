import test from 'ava'

import {
  ParsedCommand,
  ParsedCommands,
  ParseError,
  parseInput,
  parseInputCommand,
} from '../../src/parser'
import { writeFile, rm } from 'fs/promises'
import {
  AddChildCommand,
  AddInlawCommand,
  Gender,
  QueryCommand,
  Relationship,
  UpdateAction,
} from '../../src/common'
import { equip, isErr, isOk } from 'rustic'

test.beforeEach((t) => {
  t.context = './change/me'
})
test.afterEach(async (t) => {
  await rm(t.context as string, { force: true })
})

test('parseInput - file does not exist', async (t) => {
  t.context = './test/test.txt'
  await t.throwsAsync(
    async () => {
      await parseInput(t.context as string)
    },
    { instanceOf: Error, code: 'ENOENT' },
  )
})
test('parseInput - valid', async (t) => {
  t.context = './test/test-parseinput-valid.txt'
  const testContents = `
    ADD_CHILD MothersName ChildsName Female
    ADD_INLAW MothersName ChildsName SpousesName Male
    GET_RELATIONSHIP Name Brother-in-Law
  `
  const testPath = t.context as string
  writeFile(testPath, testContents)
  const result = await parseInput(testPath)
  t.assert(isOk(result), 'should have parsed input without error')
  const { updateCmds, queryCmds } = <ParsedCommands>result.data
  t.assert(updateCmds.length === 2, 'invalid number of update commands')
  t.assert(queryCmds.length === 1, 'invalid number of query commands')
  t.assert(updateCmds[0] instanceof AddChildCommand)
  t.assert(updateCmds[1] instanceof AddInlawCommand)
  t.assert(queryCmds[0] instanceof QueryCommand)
  const addChildCmd = <AddChildCommand>updateCmds[0]
  const addInlawCmd = <AddInlawCommand>updateCmds[1]
  const getRelationshipCmd = <QueryCommand>queryCmds[0]
  t.assert(addChildCmd.mothersName === 'MothersName', "wrong mother's name")
  t.assert(addChildCmd.childsName === 'ChildsName', "wrong child's name")
  t.assert(addChildCmd.gender === Gender.Female, 'wrong gender')
  t.assert(addChildCmd.action === UpdateAction.ADD_CHILD, 'wrong action')
  t.assert(addInlawCmd.mothersName === 'MothersName', "wrong mother's name")
  t.assert(addInlawCmd.childsName === 'ChildsName', "wrong child's name")
  t.assert(addInlawCmd.spousesName === 'SpousesName', "wrong spouse's name")
  t.assert(addInlawCmd.gender === Gender.Male, 'wrong gender')
  t.assert(addInlawCmd.action === UpdateAction.ADD_INLAW, 'wrong action')
  t.assert(getRelationshipCmd.name === 'Name', 'wrong name')
  t.assert(
    getRelationshipCmd.relationship === Relationship['Brother-in-Law'],
    'wrong relationship',
  )
})
test.skip('parseInput - no commands returned', async (t) => {
  t.context = './test/test-no-commands.txt'
  const testContents = `
                `
  const testPath = t.context as string
  writeFile(testPath, testContents)
  const result = await parseInput(testPath)
  t.assert(isOk(result), 'should have been no errors during parse')
  const { updateCmds, queryCmds } = <ParsedCommands>result.data
  t.assert(
    updateCmds.length === 0 && queryCmds.length === 0,
    'wrong number of commands returned',
  )
})
test('parseInputCommand - unknown action', async (t) => {
  const parts = ['ADD_CHILD1', 'Flora', 'Mnerva', 'Female']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.UNKNOWN_ACTION)
})
test('parseInputCommand - ADD_CHILD invalid args, too many', async (t) => {
  const parts = ['ADD_CHILD', 'MothersName', 'ChildsName', 'Extra', 'Female']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.INVALID_NUM_ARGS)
})
test('parseInputCommand - ADD_CHILD invalid args, too few', async (t) => {
  const parts = ['ADD_CHILD', 'Flora', 'Mnerva']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.INVALID_NUM_ARGS)
})
test('parseInputCommand - ADD_CHILD invalid args, unknown gender', async (t) => {
  const parts = ['ADD_CHILD', 'MothersName', 'ChildsName', 'Gender']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.UNKNOWN_GENDER)
})
test('parseInputCommand - ADD_CHILD valid', async (t) => {
  const parts = ['ADD_CHILD', 'MothersName', 'ChildsName', 'Female']
  const result = await parseInputCommand(parts)
  t.assert(isOk(result), 'should have parsed successfully')
  const { updateCmd, queryCmd } = <ParsedCommand>result.data
  t.assert(updateCmd !== undefined, 'should have returned an AddChildCommand')
  t.assert(updateCmd instanceof AddChildCommand, 'wrong type')
  t.assert(queryCmd === undefined, 'should not have returned a QueryCommand')
  let updateCmdTyped = <AddChildCommand>updateCmd
  t.assert(updateCmdTyped?.mothersName === 'MothersName', "wrong mother's name")
  t.assert(updateCmdTyped?.childsName === 'ChildsName', "wrong child's name")
  t.assert(updateCmdTyped?.gender === Gender.Female, 'wrong gender')
  t.assert(updateCmdTyped?.action === UpdateAction.ADD_CHILD, 'wrong action')
})
test('parseInputCommand - ADD_INLAW unknown action', async (t) => {
  const parts = ['ADD_INLAW1', 'MothersName', 'ChildsName', 'Female']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.UNKNOWN_ACTION)
})
test('parseInputCommand - ADD_INLAW invalid args, too many', async (t) => {
  const parts = [
    'ADD_INLAW',
    'MothersName',
    'ChildsName',
    'SpousesName',
    'Extra',
    'Female',
  ]
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.INVALID_NUM_ARGS)
})
test('parseInputCommand - ADD_INLAW invalid args, too few', async (t) => {
  const parts = ['ADD_INLAW', 'MothersName', 'ChildsName']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.INVALID_NUM_ARGS)
})
test('parseInputCommand - ADD_INLAW invalid args, unknown gender', async (t) => {
  const parts = ['ADD_INLAW', 'MothersName', 'ChildsName', 'SpousesName', 'Gender']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.UNKNOWN_GENDER)
})
test('parseInputCommand - ADD_INLAW valid', async (t) => {
  const parts = ['ADD_INLAW', 'MothersName', 'ChildsName', 'SpousesName', 'Male']
  const result = await parseInputCommand(parts)
  t.assert(isOk(result), 'should have parsed successfully')
  const { updateCmd, queryCmd } = <ParsedCommand>result.data
  t.assert(updateCmd !== undefined, 'should have returned an AddInlawCommand')
  t.assert(updateCmd instanceof AddInlawCommand, 'wrong type')
  t.assert(queryCmd === undefined, 'should not have returned a QueryCommand')
  let resultTyped = <AddInlawCommand>updateCmd
  t.assert(resultTyped.mothersName === 'MothersName', "wrong mother's name")
  t.assert(resultTyped.childsName === 'ChildsName', "wrong child's name")
  t.assert(resultTyped.spousesName === 'SpousesName', "wrong child's name")
  t.assert(resultTyped.gender === Gender.Male, 'wrong gender')
  t.assert(resultTyped.action === UpdateAction.ADD_INLAW, 'wrong action')
})

test('parseInputCommand - GET_RELATIONSHIP unknown action', async (t) => {
  const parts = ['GET_RELATIONSHIP1', 'Name', 'Maternal-Aunt']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.UNKNOWN_ACTION)
})
test('parseInputCommand - GET_RELATIONSHIP invalid args, too many', async (t) => {
  const parts = ['GET_RELATIONSHIP', 'Name', 'Relationship', 'Extra']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.INVALID_NUM_ARGS)
})
test('parseInputCommand - GET_RELATIONSHIP invalid args, too few', async (t) => {
  const parts = ['GET_RELATIONSHIP', 'Name']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.INVALID_NUM_ARGS)
})
test('parseInputCommand - GET_RELATIONSHIP invalid args, unknown relationship', async (t) => {
  const parts = ['GET_RELATIONSHIP', 'Name', 'Relationship']
  const result = await parseInputCommand(parts)
  t.assert(isErr(result))
  t.assert(<ParseError>result.data === ParseError.UNKNOWN_RELATIONSHIP)
})
test('parseInputCommand - GET_RELATIONSHIP valid', async (t) => {
  const parts = ['GET_RELATIONSHIP', 'Name', 'Maternal-Aunt']
  const result = await parseInputCommand(parts)
  t.assert(isOk(result), 'should have parsed successfully')
  const { updateCmd, queryCmd } = <ParsedCommand>result.data
  t.assert(queryCmd !== undefined, 'should have returned an QueryCommand')
  t.assert(queryCmd instanceof QueryCommand, 'wrong type')
  t.assert(updateCmd === undefined, 'should not have returned a Updatecommand')
  let resultTyped = <QueryCommand>queryCmd
  t.assert(resultTyped.name === 'Name', 'wrong name')
  t.assert(
    resultTyped.relationship === Relationship['Maternal-Aunt'],
    'wrong relationship',
  )
})
