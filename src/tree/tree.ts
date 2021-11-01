import { Female, Male, Person } from '../common'

export default class Tree {
  members: Person[] = new Array<Person>()
  constructor() {
    let queenMargret = new Female('Queen')
    let kingGeorge = new Male('King')
    queenMargret.husband = kingGeorge
    this.members.push(kingGeorge, queenMargret)
  }
  static findRecursive(
    mother: Female | undefined,
    predicate: (person: Person) => boolean,
  ): { mother: Female; child: Person } | undefined {
    if (!mother?.children.length) {
      return undefined
    }
    for (const child of mother.children) {
      if (predicate(child)) {
        return { mother, child }
      } else if (child instanceof Female) {
        const female = <Female>child
        let found = Tree.findRecursive(female, predicate)
        if (found) return found
      } else if (child instanceof Male) {
        const male = <Male>child
        if (male.wife !== undefined) {
          let found = Tree.findRecursive(male.wife, predicate);
          if (found) return found;
        }
      }
    }
    return undefined
  }
  find(
    predicate: (person: Person) => boolean,
  ): { mother: Female; child: Person; } | undefined {

    let root = new Female('root')
    root.children = this.members
    return Tree.findRecursive(root, predicate)
  }
  findByName(name: string) {
    return this.find((p) => p.name === name)
  }
  findMother(name: string) {
    return this.find(
      (p) => p instanceof Female && (<Female>p).children.some((c) => c.name === name),
    )
  }
  toString() {
    return this.members.map((m) => JSON.stringify(m, null, 2))
  }
}
