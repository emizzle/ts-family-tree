import { Err, Result } from 'rustic'
import { Person, QueryError, QueryCommand, Relationship } from '../../common'
import Tree from '../tree'
import TreeQuerier from './base'
import BrotherInLawQuerier from './brother_in_law'
import DaughterQuerier from './daughter'
import MaternalAuntQuerier from './maternal_aunt'
import MaternalUncleQuerier from './maternal_uncle'
import PaternalAuntQuerier from './paternal_aunt'
import PaternalUncleQuerier from './paternal_uncle'
import SiblingQuerier from './siblings'
import SisterInLawQuerier from './sister_in_law'
import SonQuerier from './son'

type QuerierMap = {
  [Property in keyof typeof Relationship]: TreeQuerier
}

export default class TreeQuerierFactory {
  private map: QuerierMap
  constructor(tree: Tree) {
    this.map = {
      ['Brother-in-Law']: new BrotherInLawQuerier(tree),
      ['Daughter']: new DaughterQuerier(tree),
      ['Maternal-Aunt']: new MaternalAuntQuerier(tree),
      ['Maternal-Uncle']: new MaternalUncleQuerier(tree),
      ['Paternal-Aunt']: new PaternalAuntQuerier(tree),
      ['Paternal-Uncle']: new PaternalUncleQuerier(tree),
      ['Siblings']: new SiblingQuerier(tree),
      ['Sister-in-Law']: new SisterInLawQuerier(tree),
      ['Son']: new SonQuerier(tree),
    }
  }
  query(cmd: QueryCommand): Result<Person[], QueryError> {
    const { relationship, name } = cmd
    let querier = this.map[<any>Relationship[relationship]]
    if (querier === undefined) {
      return Err(QueryError.UNKNOWN_QUERIER)
    }
    return querier.query(name)
  }
}
