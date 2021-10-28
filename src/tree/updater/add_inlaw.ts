import { Err, Ok, Result } from 'rustic'
import {
  Person,
  UpdateError,
  UpdateResult,
  Female,
  Gender,
  Male,
  AddInlawCommand,
} from '../../common'
import Tree from '../tree'
import TreeUpdater from './base';

export default class AddInlawUpdater extends TreeUpdater {
  constructor(tree: Tree) {
    super(tree)
  }
  override update(cmd: AddInlawCommand): Result<UpdateResult, UpdateError> {
    const { mothersName, childsName, spousesName, gender } = cmd
    const found = this.tree.findByName(mothersName)
    if (found === undefined) {
      return Err(UpdateError.PERSON_NOT_FOUND)
    }
    const mother = <Female>found.child
    const foundSpouse = Tree.findRecursive(mother, (p) => p.name === spousesName)
    if (foundSpouse === undefined) {
      return Err(UpdateError.SPOUSE_NOT_FOUND)
    }
    let inlaw: Person
    if (gender === Gender.Female) {
      let husband = <Male>foundSpouse.child
      inlaw = new Female(childsName, true)
      ;(<Female>inlaw).husband = husband
    } else {
      let wife = <Female>foundSpouse.child
      inlaw = new Male(childsName, true)
      wife.husband = inlaw
    }
    mother.children.push(inlaw)
    return Ok(UpdateResult.INLAW_ADDED)
  }
}
