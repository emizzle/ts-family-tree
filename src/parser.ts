import { readFile } from 'fs/promises'
import { Err, isErr, Ok, Result } from 'rustic'
import {
  AddChildCommand,
  AddInlawCommand,
  Gender,
  QueryCommand,
  Relationship,
  UpdateCommand,
  InputAction,
} from './common'

export enum ParseError {
  INVALID_NUM_ARGS,
  UNKNOWN_GENDER,
  UNKNOWN_RELATIONSHIP,
  UNKNOWN_ACTION,
}

export type ParsedCommand = {
  updateCmd: UpdateCommand | undefined
  queryCmd: QueryCommand | undefined
}
export type ParsedCommands = {
  updateCmds: UpdateCommand[]
  queryCmds: QueryCommand[]
}

export function parseInputCommand(parts: string[]): Result<ParsedCommand, ParseError> {
  const actionRaw = parts[0] as string
  const action = (<any>InputAction)[actionRaw]
  switch (action) {
    case InputAction.ADD_CHILD:
      if (parts.length !== 4) {
        return Err(ParseError.INVALID_NUM_ARGS)
      }
      const gender = (<any>Gender)[parts[3] as string]
      if (gender === undefined) {
        return Err(ParseError.UNKNOWN_GENDER)
      }
      return Ok({
        updateCmd: new AddChildCommand(parts[1] as string, parts[2] as string, gender),
        queryCmd: undefined,
      })

    case InputAction.ADD_INLAW:
      if (parts.length !== 5) {
        return Err(ParseError.INVALID_NUM_ARGS)
      }
      const genderInLaw = (<any>Gender)[parts[4] as string]
      if (genderInLaw === undefined) {
        return Err(ParseError.UNKNOWN_GENDER)
      }
      return Ok({
        updateCmd: new AddInlawCommand(
          parts[1] as string,
          parts[2] as string,
          parts[3] as string,
          genderInLaw,
        ),
        queryCmd: undefined,
      })

    case InputAction.GET_RELATIONSHIP:
      if (parts.length !== 3) {
        return Err(ParseError.INVALID_NUM_ARGS)
      }
      const relationship = (<any>Relationship)[parts[2] as string]
      if (relationship === undefined) {
        return Err(ParseError.UNKNOWN_RELATIONSHIP)
      }
      return Ok({
        updateCmd: undefined,
        queryCmd: new QueryCommand(parts[1] as string, relationship),
      })

    default:
      return Err(ParseError.UNKNOWN_ACTION)
  }
}
export async function parseInput(path: string): Promise<Result<ParsedCommands, ParseError>> {
  const updateCmds: UpdateCommand[] = []
  const queryCmds: QueryCommand[] = []
  const input = await readFile(path)
  const lines = input
    .toString()
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x !== '')

  for (const line of lines) {
    const parts = line.split(' ')
    const result = parseInputCommand(parts)
    if (isErr(result)) {
      return Err(result.data)
    }
    const {updateCmd, queryCmd} = result.data
    if (updateCmd) {
      updateCmds.push(updateCmd)
    }
    if (queryCmd) {
      queryCmds.push(queryCmd)
    }
  }
  return Ok({ updateCmds, queryCmds })
}
