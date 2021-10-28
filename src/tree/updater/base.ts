import { Result } from 'rustic'
import { UpdateError, UpdateCommand, UpdateResult } from '../../common'
import Tree from '../tree'

export default class TreeUpdater {
  protected tree: Tree
  constructor(tree: Tree) {
    this.tree = tree
  }
  update(cmd: UpdateCommand): Result<UpdateResult, UpdateError> {
    throw new Error('must be implemented')
  }
}
