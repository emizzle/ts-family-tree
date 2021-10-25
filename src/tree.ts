import {
  Action,
  AddChildCommand,
  AddInlawCommand,
  Female,
  Gender,
  InputCommand,
  Male,
  Person,
} from './common'

export default class Tree {
  members: Person[] = new Array<Person>()
  constructor() {
    let queenMargret = new Female('Queen')
    let kingGeorge = new Person('King')
    queenMargret.husband = kingGeorge
    this.members.push(kingGeorge, queenMargret)
  }
  static findRecursive(
    members: Person[] | undefined,
    name: string,
  ): Person | undefined {
    if (members === undefined) {
      return undefined
    }
    for (const member of members) {
      if (member.name === name) {
        return member
      } else if (member instanceof Female) {
        let found = Tree.findRecursive((<Female>member).children, name)
        if (found) return found
      }
      // else if (typeof member === typeof Male) {
      //   return Tree.findRecursive((<Male>member).wife?.children, name)
      // }
    }
    return undefined
  }
  find(name: string): Person | undefined {
    return Tree.findRecursive(this.members, name)
  }
  manipulate(inputCmd: InputCommand) {
    switch (inputCmd.action) {
      case Action.ADD_CHILD:
        let addChildCmd = <AddChildCommand>inputCmd
        let found = this.find(addChildCmd.mothersName)
        if (found === undefined) {
          return 'PERSON_NOT_FOUND'
        } else if (found instanceof Male) {
          return 'CHILD_ADDITION_FAILED'
        }
        let mother = <Female>found
        let person: Person
        if (addChildCmd.gender === Gender.Female) {
          person = new Female(addChildCmd.childsName)
        } else {
          person = new Male(addChildCmd.childsName)
        }
        mother.children?.push(person)
        return 'CHILD_ADDED'

      case Action.ADD_INLAW:
        let addInlawCmd = <AddInlawCommand>inputCmd
        const foundMother = this.find(addInlawCmd.mothersName)
        if (foundMother === undefined) {
          return 'PERSON_NOT_FOUND'
        } else if (foundMother instanceof Male) {
          return 'SPOUSE_ADDITION_FAILED'
        }
        mother = <Female>foundMother
        const foundSpouse = Tree.findRecursive(mother.children, addInlawCmd.spousesName)
        if (foundSpouse === undefined) {
          return 'SPOUSE_NOT_FOUND'
        }
        let inlaw: Person
        if (addInlawCmd.gender === Gender.Female) {
          let husband = <Male>foundSpouse
          inlaw = new Female(addInlawCmd.childsName, true)
          ;(<Female>inlaw).husband = husband
          // husband.wife = inlaw
        } else {
          let wife = <Female>foundSpouse
          inlaw = new Male(addInlawCmd.childsName, true)
          // ;(<Male>inlaw).wife = wife
          wife.husband = inlaw
        }
        mother.children?.push(inlaw)
        return 'CHILD_ADDED'
    }
    return 'DIDN"T go too far yet'
  }
  toString() {
    return this.members.map((m) => JSON.stringify(m, null, 2))
  }
}
