import { Err, Ok, Result } from "rustic";
import { Female, Person, QueryError } from "../../common";
import Tree from "../tree";
import TreeQuerier from "./base";

export default class SisterInLawQuerier extends TreeQuerier {
  constructor(tree: Tree) {
    super(tree)
  }
  override query(name: string): Result<Person[], QueryError> {
    const found = this.tree.findByName(name)
    if (found === undefined) {
      return Err(QueryError.PERSON_NOT_FOUND)
    }
    let result = new Array<Person>()
    const { mother } = found
    if (
      mother === undefined ||
      mother.children === undefined ||
      mother.children.length === 0
    ) {
      return Ok(result)
    }
    let sistersInLaw = mother.children.filter(
      (c) => c instanceof Female && c.inlaw,
    )
    return Ok(sistersInLaw)
  }
}