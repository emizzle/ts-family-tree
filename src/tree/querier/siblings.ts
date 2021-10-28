import { Err, Ok, Result } from "rustic";
import { Female, Male, Person, QueryError } from "../../common";
import Tree from "../tree";
import TreeQuerier from "./base";

export default class SiblingQuerier extends TreeQuerier {
  constructor(tree: Tree) {
    super(tree)
  }
  override query(name: string): Result<Person[], QueryError> {
    const found = this.tree.findByName(name)
    if (found === undefined) {
      return Err(QueryError.PERSON_NOT_FOUND)
    }
    let result = new Array<Person>()
    const { mother, child } = found
    if (mother === undefined) {
      return Ok(result)
    }
    if (child === undefined || child.inlaw) {
      return Ok(result)
    }
    if (mother.children === undefined || mother.children.length === 0) {
      return Ok(result)
    }
    const siblings = mother.children.filter((c) => {
      const isHusband = c instanceof Female && (<Female>c).husband?.name === name
      const isSelf = c.name === name
      const isWife =
        c instanceof Male &&
        mother.children.find(
          (s) =>
            s !== undefined &&
            s instanceof Female &&
            (<Female>s).husband?.name === name,
        )
      return !isHusband && !isWife && !isSelf && !c.inlaw
    })
    return Ok(siblings)
  }
}