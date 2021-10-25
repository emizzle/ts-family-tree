import { readFile } from 'fs/promises'
import {
  Action,
  AddChildCommand,
  AddInlawCommand,
  Gender,
  GetRelationshipCommand,
  InputCommand,
  Relationship,
} from './common'

export function parseInputCommand(parts: string[]) {
  const actionRaw = parts[0] as string
  const action = (<any>Action)[actionRaw]
  switch (action) {
    case Action.ADD_CHILD:
      if (parts.length !== 4) {
        throw new Error('Invalid number of args for ADD_CHILD command')
      }
      const gender = (<any>Gender)[parts[3] as string]
      if (gender === undefined) {
        throw new Error('Unknown gender')
      }
      return new AddChildCommand(parts[1] as string, parts[2] as string, gender)

    case Action.ADD_INLAW:
      if (parts.length !== 5) {
        throw new Error('Invalid number of args for ADD_INLAW command')
      }
      const genderInLaw = (<any>Gender)[parts[4] as string]
      if (genderInLaw === undefined) {
        throw new Error('Unknown gender')
      }
      return new AddInlawCommand(
        parts[1] as string,
        parts[2] as string,
        parts[3] as string,
        genderInLaw,
      )

    case Action.GET_RELATIONSHIP:
      if (parts.length !== 3) {
        throw new Error('Invalid number of args for GET_RELATIONSHIP command')
      }
      const relationship = (<any>Relationship)[parts[2] as string]
      if (relationship === undefined) {
        throw new Error('Unknown relationship')
      }
      return new GetRelationshipCommand(parts[1] as string, relationship)

    default:
      throw new Error(`Unknown action ${actionRaw}`)
  }
}
export async function parseInput(path: string) {
  const inputCmds: InputCommand[] = []
  const input = await readFile(path)
  const lines = input
    .toString()
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x !== '')

  for (const line of lines) {
    const parts = line.split(' ')
    const parsed = parseInputCommand(parts)
    inputCmds.push(parsed)
  }
  return inputCmds
}
