import { Result } from 'rustic'
import { Person, QueryError } from '../../common'
import Tree from '../tree'

export default class TreeQuerier {
  protected tree: Tree
  constructor(tree: Tree) {
    this.tree = tree
  }
  query(name: string): Result<Person[], QueryError> {
    throw new Error('must be implemented')
  }
}
