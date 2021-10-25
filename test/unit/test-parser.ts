import test from 'ava'

import { parseInput, parseInputCommand } from '../../src/parser'
import { writeFile, rm } from 'fs/promises'
import {
  Action,
  AddChildCommand,
  AddInlawCommand,
  Gender,
  GetRelationshipCommand,
  Relationship,
} from '../../src/common'

test('parseInput - file does not exist', async (t) => {
  const testPath = './test/test.txt'
  await t.throwsAsync(
    async () => {
      await parseInput(testPath)
    },
    { instanceOf: Error, code: 'ENOENT' },
  )
})
test('parseInput - valid', async (t) => {
  const testPath = './test/test-parseinput-valid.txt'
  const testContents = `
    ADD_CHILD MothersName ChildsName Female
    ADD_INLAW MothersName ChildsName SpousesName Male
    GET_RELATIONSHIP Name Brother-in-Law
  `
  writeFile(testPath, testContents)
  const result = await parseInput(testPath)
  t.assert(result.length === 3, 'invalid number of results')
  t.assert(result[0] instanceof AddChildCommand)
  t.assert(result[1] instanceof AddInlawCommand)
  t.assert(result[2] instanceof GetRelationshipCommand)
  const addChildCmd = <AddChildCommand>result[0]
  const addInlawCmd = <AddInlawCommand>result[1]
  const getRelationshipCmd = <GetRelationshipCommand>result[2]
  t.assert(addChildCmd.mothersName === 'MothersName', "wrong mother's name")
  t.assert(addChildCmd.childsName === 'ChildsName', "wrong child's name")
  t.assert(addChildCmd.gender === Gender.Female, 'wrong gender')
  t.assert(addChildCmd.action === Action.ADD_CHILD, 'wrong action')
  t.assert(addInlawCmd.mothersName === 'MothersName', "wrong mother's name")
  t.assert(addInlawCmd.childsName === 'ChildsName', "wrong child's name")
  t.assert(addInlawCmd.spousesName === 'SpousesName', "wrong spouse's name")
  t.assert(addInlawCmd.gender === Gender.Male, 'wrong gender')
  t.assert(addInlawCmd.action === Action.ADD_INLAW, 'wrong action')
  t.assert(getRelationshipCmd.name === 'Name', 'wrong name')
  t.assert(
    getRelationshipCmd.relationship === Relationship['Brother-in-Law'],
    'wrong relationship',
  )
  t.assert(getRelationshipCmd.action === Action.GET_RELATIONSHIP, 'wrong action')
  await rm(testPath)
})
test('parseInput - no commands returned', async (t) => {
  const testPath = './test/test-no-commands.txt'
  const testContents = `
               `
  writeFile(testPath, testContents)
  const result = await parseInput(testPath)
  t.assert(result.length === 0, 'wrong number of commands returned')
  await rm(testPath)
})
test('parseInputCommand - unknown action', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_CHILD1', 'Flora', 'Mnerva', 'Female']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Unknown action ADD_CHILD1',
    },
  )
})
test('parseInputCommand - ADD_CHILD invalid args, too many', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_CHILD', 'MothersName', 'ChildsName', 'Extra', 'Female']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Invalid number of args for ADD_CHILD command',
    },
  )
})
test('parseInputCommand - ADD_CHILD invalid args, too few', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_CHILD', 'Flora', 'Mnerva']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Invalid number of args for ADD_CHILD command',
    },
  )
})
test('parseInputCommand - ADD_CHILD invalid args, unknown gender', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_CHILD', 'MothersName', 'ChildsName', 'Gender']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Unknown gender',
    },
  )
})
test('parseInputCommand - ADD_CHILD valid', async (t) => {
  const parts = ['ADD_CHILD', 'MothersName', 'ChildsName', 'Female']
  const result = await parseInputCommand(parts)
  t.assert(<any>result instanceof AddChildCommand, 'wrong type')
  let resultTyped = <AddChildCommand>(<unknown>result)
  t.assert(resultTyped.mothersName === 'MothersName', "wrong mother's name")
  t.assert(resultTyped.childsName === 'ChildsName', "wrong child's name")
  t.assert(resultTyped.gender === Gender.Female, 'wrong gender')
  t.assert(resultTyped.action === Action.ADD_CHILD, 'wrong action')
})
test('parseInputCommand - ADD_INLAW unknown action', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_INLAW1', 'MothersName', 'ChildsName', 'Female']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Unknown action ADD_INLAW1',
    },
  )
})
test('parseInputCommand - ADD_INLAW invalid args, too many', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = [
        'ADD_INLAW',
        'MothersName',
        'ChildsName',
        'SpousesName',
        'Extra',
        'Female',
      ]
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Invalid number of args for ADD_INLAW command',
    },
  )
})
test('parseInputCommand - ADD_INLAW invalid args, too few', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_INLAW', 'MothersName', 'ChildsName']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Invalid number of args for ADD_INLAW command',
    },
  )
})
test('parseInputCommand - ADD_INLAW invalid args, unknown gender', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['ADD_INLAW', 'MothersName', 'ChildsName', 'SpousesName', 'Gender']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Unknown gender',
    },
  )
})
test('parseInputCommand - ADD_INLAW valid', async (t) => {
  const parts = ['ADD_INLAW', 'MothersName', 'ChildsName', 'SpousesName', 'Male']
  const result = await parseInputCommand(parts)
  t.assert(result instanceof AddInlawCommand, 'wrong type')
  let resultTyped = <AddInlawCommand>(<unknown>result)
  t.assert(resultTyped.mothersName === 'MothersName', "wrong mother's name")
  t.assert(resultTyped.childsName === 'ChildsName', "wrong child's name")
  t.assert(resultTyped.spousesName === 'SpousesName', "wrong child's name")
  t.assert(resultTyped.gender === Gender.Male, 'wrong gender')
  t.assert(resultTyped.action === Action.ADD_INLAW, 'wrong action')
})

test('parseInputCommand - GET_RELATIONSHIP unknown action', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['GET_RELATIONSHIP1', 'Name', 'Maternal-Aunt']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Unknown action GET_RELATIONSHIP1',
    },
  )
})
test('parseInputCommand - GET_RELATIONSHIP invalid args, too many', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['GET_RELATIONSHIP', 'Name', 'Relationship', 'Extra']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Invalid number of args for GET_RELATIONSHIP command',
    },
  )
})
test('parseInputCommand - GET_RELATIONSHIP invalid args, too few', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['GET_RELATIONSHIP', 'Name']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Invalid number of args for GET_RELATIONSHIP command',
    },
  )
})
test('parseInputCommand - GET_RELATIONSHIP invalid args, unknown relationship', async (t) => {
  await t.throwsAsync(
    async () => {
      const parts = ['GET_RELATIONSHIP', 'Name', 'Relationship']
      await parseInputCommand(parts)
    },
    {
      instanceOf: Error,
      message: 'Unknown relationship',
    },
  )
})
test('parseInputCommand - GET_RELATIONSHIP valid', async (t) => {
  const parts = ['GET_RELATIONSHIP', 'Name', 'Maternal-Aunt']
  const result = await parseInputCommand(parts)
  t.assert(result instanceof GetRelationshipCommand, 'wrong type')
  let resultTyped = <GetRelationshipCommand>(<unknown>result)
  t.assert(resultTyped.name === 'Name', 'wrong name')
  t.assert(
    resultTyped.relationship === Relationship['Maternal-Aunt'],
    'wrong relationship',
  )
  t.assert(resultTyped.action === Action.GET_RELATIONSHIP, 'wrong action')
})
