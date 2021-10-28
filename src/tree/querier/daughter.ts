import { Err, isErr, Ok, Result } from "rustic";
import { Female, Male, Person, QueryError } from "../../common";
import Tree from "../tree";
import TreeQuerier from "./base";

export default class DaughterQuerier extends TreeQuerier {
  constructor(tree: Tree) {
    super(tree)
  }
  override query(name: string): Result<Person[], QueryError> {
    const found = this.tree.findByName(name)
    if (found === undefined) {
      return Err(QueryError.PERSON_NOT_FOUND)
    }
    let result = new Array<Person>()
    const { child } = found
    if (child instanceof Male) {
      return Ok(result)
    }
    let femaleChild = <Female>child
    if (femaleChild.children === undefined || femaleChild.children.length === 0) {
      return Ok(result)
    }
    let daughters = femaleChild.children.filter((c) => c instanceof Female)
    return Ok(daughters)
  }
}