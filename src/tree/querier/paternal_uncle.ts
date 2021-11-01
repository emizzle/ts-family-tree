import { Err, Ok, Result } from "rustic";
import { Female, Male, Person, QueryError } from "../../common";
import Tree from "../tree";
import TreeQuerier from "./base";

export default class PaternalUncleQuerier extends TreeQuerier {
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
    const father = mother.husband
    if (father === undefined || father.inlaw) {
      return Ok(result)
    }
    let grandmaSearch = this.tree.findMother(mother.name)
    if (grandmaSearch === undefined) {
      return Err(QueryError.PERSON_NOT_FOUND)
    }
    let grandma = <Female>grandmaSearch.child
    const paternalUncles = grandma.children.filter((s) =>
      s instanceof Male &&
      s.name !== mother.husband?.name &&
      !s.inlaw
    )
    return Ok(paternalUncles)
  }
}