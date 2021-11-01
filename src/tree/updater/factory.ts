import { Err, Result } from 'rustic'
import {
  AddChildCommand,
  UpdateCommand,
  AddInlawCommand,
  UpdateError,
  UpdateResult,
} from '../../common'
import Tree from '../tree'
import TreeUpdater from '../updater/base'
import AddChildUpdater from './add_child'
import AddInlawUpdater from './add_inlaw'

type UpdateMap = {
  type: string
  updater: TreeUpdater
}

export default class TreeUpdaterFactory {
  private map: UpdateMap[]
  constructor(tree: Tree) {
    this.map = [
      {
        type: AddChildCommand.prototype.constructor.name,
        updater: new AddChildUpdater(tree),
      },
      {
        type: AddInlawCommand.prototype.constructor.name,
        updater: new AddInlawUpdater(tree),
      },
    ]
  }
  update(cmd: UpdateCommand): Result<UpdateResult, UpdateError> {
    let updater = this.map.find((x) => cmd.constructor.name === x.type)
    if (updater === undefined) {
      return Err(UpdateError.UNKNOWN_UPDATER)
    }
    return updater.updater.update(cmd)
  }
}
