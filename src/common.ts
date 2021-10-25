export enum Action {
  'ADD_CHILD',
  'ADD_INLAW',
  'GET_RELATIONSHIP',
}
export enum Gender {
  'Male',
  'Female',
}
export enum Relationship {
  'Paternal-Uncle',
  'Maternal-Uncle',
  'Paternal-Aunt',
  'Maternal-Aunt',
  'Sister-in-Law',
  'Brother-in-Law',
  'Son',
  'Daughter',
  'Siblings',
}

export class Person {
  name: string
  // mother?: Person
  inlaw: Boolean
  constructor(
    name: string,
    // mother: Person | undefined = undefined,
    inlaw: Boolean = false,
  ) {
    this.name = name
    // this.mother = mother
    this.inlaw = inlaw
  }
}
export class Male extends Person {
  wife?: Female
}
export class Female extends Person {
  children?: Person[] = new Array<Person>()
  husband?: Male
}
export class InputCommand {
  action: Action
  constructor(action: Action) {
    this.action = action
  }
}export class AddChildCommand extends InputCommand {
  mothersName: string;
  childsName: string;
  gender: Gender;
  constructor(mothersName: string, childsName: string, gender: Gender) {
    super(Action.ADD_CHILD);
    this.mothersName = mothersName;
    this.childsName = childsName;
    this.gender = gender;
  }
}
export class AddInlawCommand extends AddChildCommand {
  spousesName: string
  constructor(mothersName: string, childsName: string, spousesName: string, gender: Gender) {
    super(mothersName, childsName, gender)
    this.action = Action.ADD_INLAW
    this.spousesName = spousesName
  }

  override toString() {
    return `{
      action: ${this.action},
      mothersName: ${this.mothersName},
      childsName: ${this.childsName},
      gender: ${this.gender}
    }`
  }
}
export class GetRelationshipCommand extends InputCommand {
  name: string
  relationship: Relationship
  constructor(name: string, relationship: Relationship) {
    super(Action.GET_RELATIONSHIP)
    this.name = name
    this.relationship = relationship
  }

  override toString() {
    return `{
      action: ${this.action},
      name: ${this.name},
      relationship: ${this.relationship}
    }`
  }
}
