import { Relationship } from './common'
import { Female, Gender, Male, Person } from './common'
import { Result, Err, Ok, isErr } from 'rustic'
import { ENGINE_METHOD_CIPHERS } from 'constants'

export default class Tree {
  members: Person[] = new Array<Person>()
  constructor() {
    let queenMargret = new Female('Queen')
    let kingGeorge = new Person('King')
    queenMargret.husband = kingGeorge
    this.members.push(kingGeorge, queenMargret)
  }
  static findRecursive(
    mother: Female | undefined,
    // members: Person[] | undefined,
    name: string,
  ): { mother: Female; child: Person } | undefined {
    if (mother?.children === undefined || mother?.children.length === 0) {
      return undefined
    }
    for (const child of mother.children) {
      if (child.name === name) {
        return { mother, child }
      } else if (child instanceof Female) {
        const female = <Female>child
        let found = Tree.findRecursive(female, name)
        if (found) return found
      }
      // else if (typeof member === typeof Male) {
      //   return Tree.findRecursive((<Male>member).wife?.children, name)
      // }
    }
    return undefined
  }
  find(name: string): { mother: Female; child: Person } | undefined {
    let root = new Female('root')
    root.children = this.members
    return Tree.findRecursive(root, name)
  }
  addChild(
    mothersName: string,
    childsName: string,
    gender: Gender,
  ): Result<void, string> {
    let found = this.find(mothersName)
    if (found === undefined) {
      return Err('PERSON_NOT_FOUND')
    } else if (found.child instanceof Male) {
      return Err('CHILD_ADDITION_FAILED')
    }
    let mother = <Female>found.child
    let person: Person
    if (gender === Gender.Female) {
      person = new Female(childsName)
    } else {
      person = new Male(childsName)
    }
    mother.children?.push(person)
    return Ok(undefined)
  }
  addInlaw(
    mothersName: string,
    childsName: string,
    spousesName: string,
    gender: Gender,
  ): Result<void, string> {
    const found = this.find(mothersName)
    if (found === undefined) {
      return Err('PERSON_NOT_FOUND')
    }
    // else if (found.child instanceof Male) {
    //   return 'SPOUSE_ADDITION_FAILED'
    // }
    const mother = <Female>found.child
    const foundSpouse = Tree.findRecursive(mother, spousesName)
    if (foundSpouse === undefined) {
      return Err('SPOUSE_NOT_FOUND')
    }
    let inlaw: Person
    if (gender === Gender.Female) {
      let husband = <Male>foundSpouse.child
      inlaw = new Female(childsName, true)
      ;(<Female>inlaw).husband = husband
      // husband.wife = inlaw
    } else {
      let wife = <Female>foundSpouse.child
      inlaw = new Male(childsName, true)
      // ;(<Male>inlaw).wife = wife
      wife.husband = inlaw
    }
    mother.children?.push(inlaw)
    return Ok(undefined)
  }
  query(name: string, relationship: Relationship): Result<Person[], string> {
    const found = this.find(name)
    if (found === undefined) {
      return Err('PERSON_NOT_FOUND')
    }
    let result = new Array<Person>()
    const { mother, child } = found
    const father = mother.husband
    let parentSiblings: Result<Person[], string> // = Ok(new Array<Person>())
    switch (relationship) {
      case Relationship['Paternal-Uncle']:
        if (father === undefined) {
          return Ok(result)
        }
        parentSiblings = this.query(father.name, Relationship.Siblings)
        if (isErr(parentSiblings) || parentSiblings.data.length === 0) {
          return Ok(result)
        }
        const uncles = parentSiblings.data.filter((s) => s instanceof Male)
        return Ok(uncles)

      case Relationship['Maternal-Uncle']:
        if (mother === undefined) {
          return Ok(result)
        }
        parentSiblings = this.query(mother.name, Relationship.Siblings)
        if (isErr(parentSiblings) || parentSiblings.data.length === 0) {
          return Ok(result)
        }
        const maternalUncles = parentSiblings.data.filter((s) => s instanceof Male)
        return Ok(maternalUncles)

      case Relationship['Paternal-Aunt']:
        if (father === undefined) {
          return Ok(result)
        }
        parentSiblings = this.query(father.name, Relationship.Siblings)
        if (isErr(parentSiblings) || parentSiblings.data.length === 0) {
          return Ok(result)
        }
        const paternalAunts = parentSiblings.data.filter((s) => s instanceof Female)
        return Ok(paternalAunts)

      case Relationship['Maternal-Aunt']:
        if (mother === undefined) {
          return Ok(result)
        }
        parentSiblings = this.query(mother.name, Relationship.Siblings)
        if (isErr(parentSiblings) || parentSiblings.data.length === 0) {
          return Ok(result)
        }
        const maternalAunts = parentSiblings.data.filter((s) => s instanceof Female)
        return Ok(maternalAunts)

      case Relationship['Sister-in-Law']:
        if (
          mother === undefined ||
          mother.children === undefined ||
          mother.children.length === 0
        ) {
          return Ok(result)
        }
        let sistersInLaw = mother.children?.filter(
          (c) => c instanceof Female && c.inlaw,
        )
        return Ok(sistersInLaw)

      case Relationship['Brother-in-Law']:
        if (
          mother === undefined ||
          mother.children === undefined ||
          mother.children.length === 0
        ) {
          return Ok(result)
        }
        let brothersInLaw = mother.children?.filter((c) => c instanceof Male && c.inlaw)
        return Ok(brothersInLaw)

      case Relationship['Son']:
        if (child instanceof Male) {
          return Ok(result)
        }
        let femaleChild = <Female>child
        if (femaleChild.children === undefined || femaleChild.children.length === 0) {
          return Ok(result)
        }
        let sons = femaleChild.children?.filter((c) => c instanceof Male)
        return Ok(sons)

      case Relationship['Daughter']:
        if (child instanceof Male) {
          return Ok(result)
        }
        femaleChild = <Female>child
        if (femaleChild.children === undefined || femaleChild.children.length === 0) {
          return Ok(result)
        }
        let daughters = femaleChild.children?.filter((c) => c instanceof Female)
        return Ok(daughters)

      case Relationship['Siblings']:
        if (mother === undefined) {
          return Ok(result)
        }
        if (mother.children === undefined || mother.children.length === 0) {
          return Ok(result)
        }
        const siblings = mother.children.filter((c) => {
          let isHusband = c instanceof Female && (<Female>c).husband?.name === name
          const isSelf = c.name === name
          const isWife =
            c instanceof Male &&
            mother.children?.find(
              (s) =>
                s !== undefined &&
                s instanceof Female &&
                (<Female>s).husband?.name === name,
            )
          return !isHusband && !isWife && !isSelf
        })
        return Ok(siblings)

      default:
        return Ok(result)
    }
  }
  toString() {
    return this.members.map((m) => JSON.stringify(m, null, 2))
  }
}
