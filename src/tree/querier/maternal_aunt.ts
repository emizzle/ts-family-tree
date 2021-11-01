import { Err, Ok, Result } from "rustic";
import { Female, Person, QueryError } from "../../common";
import Tree from "../tree";
import TreeQuerier from "./base";

export default class MaternalAuntQuerier extends TreeQuerier {
  constructor(tree: Tree) {
    super(tree)
  }
  override query(name: string): Result<Person[], QueryError> {
    const found = this.tree.findByName(name);
    if (found === undefined) {
      return Err(QueryError.PERSON_NOT_FOUND);
    }
    let result = new Array<Person>();
    const { mother } = found;
    if (mother === undefined || mother.inlaw) {
      return Ok(result);
    }
    let grandmaSearch = this.tree.findMother(mother.name)
    if (grandmaSearch === undefined) {
      return Err(QueryError.PERSON_NOT_FOUND)
    }
    let grandma = <Female>grandmaSearch.child
    const maternalAunts = grandma.children.filter((s) =>
      s instanceof Female &&
      s.name !== mother.name &&
      !s.inlaw
    )
    return Ok(maternalAunts)
  }
}