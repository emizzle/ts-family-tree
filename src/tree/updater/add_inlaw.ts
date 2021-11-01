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
    const { mothersName, childsName: inlawsName, spousesName, gender } = cmd
    const found = this.tree.findByName(mothersName)
    if (found === undefined) {
      return Err(UpdateError.PERSON_NOT_FOUND)
    }
    const mother = <Female>found.child
    const foundSpouse = Tree.findRecursive(mother, (p) => p.name === spousesName)
    if (foundSpouse === undefined) {
      return Err(UpdateError.SPOUSE_NOT_FOUND)
    }
    const { child: spouse } = foundSpouse
    let inlaw: Person
    if (gender === Gender.Female) {
      const husband: Male = <Male>spouse
      inlaw = new Female(inlawsName, true)
        ; (<Female>inlaw).husband = husband;
      husband.wife = <Female>inlaw
    } else {
      let wife = <Female>spouse
      inlaw = new Male(inlawsName, true)
      wife.husband = <Male>inlaw;
      (<Male>inlaw).wife = wife
    }
    mother.children.push(inlaw)
    return Ok(UpdateResult.INLAW_ADDED)
  }
}
