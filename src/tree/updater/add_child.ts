import { Err, Ok, Result } from 'rustic'
import {
  Person,
  UpdateError,
  UpdateResult,
  AddChildCommand,
  Female,
  Gender,
  Male,
} from '../../common'
import Tree from '../tree'
import TreeUpdater from './base';

export default class AddChildUpdater extends TreeUpdater {
  constructor(tree: Tree) {
    super(tree)
  }
  override update(cmd: AddChildCommand): Result<UpdateResult, UpdateError> {
    const { mothersName, childsName, gender } = cmd
    const found = this.tree.findByName(mothersName)
    if (found === undefined) {
      return Err(UpdateError.PERSON_NOT_FOUND)
    } else if (found.child instanceof Male) {
      return Err(UpdateError.CHILD_ADDITION_FAILED)
    }
    let mother = <Female>found.child
    let person: Person
    if (gender === Gender.Female) {
      person = new Female(childsName)
    } else {
      person = new Male(childsName)
    }
    mother.children.push(person)
    return Ok(UpdateResult.CHILD_ADDED)
  }
}
