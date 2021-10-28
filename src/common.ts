export enum UpdateAction {
  'ADD_CHILD',
  'ADD_INLAW',
}
export enum InputAction {
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
  children: Person[] = new Array<Person>()
  husband?: Male
}
export class UpdateCommand {
  action: UpdateAction
  constructor(action: UpdateAction) {
    this.action = action
  }
}
export class AddChildCommand extends UpdateCommand {
  mothersName: string;
  childsName: string;
  gender: Gender;
  constructor(mothersName: string, childsName: string, gender: Gender) {
    super(UpdateAction.ADD_CHILD);
    this.mothersName = mothersName;
    this.childsName = childsName;
    this.gender = gender;
  }
  override toString() {
    return `{
      action: ${UpdateAction[this.action]},
      mothersName: ${this.mothersName},
      childsName: ${this.childsName},
      gender: ${Gender[this.gender]}
    }`;
  }
}
export class AddInlawCommand extends AddChildCommand {
  spousesName: string;
  constructor(mothersName: string, childsName: string, spousesName: string, gender: Gender) {
    super(mothersName, childsName, gender);
    this.action = UpdateAction.ADD_INLAW;
    this.spousesName = spousesName;
  }

  override toString() {
    return `{
      action: ${UpdateAction[this.action]},
      mothersName: ${this.mothersName},
      childsName: ${this.childsName},
      spousesName: ${this.spousesName},
      gender: ${Gender[this.gender]}
    }`;
  }
}
export class QueryCommand {
  name: string
  relationship: Relationship
  constructor(name: string, relationship: Relationship) {
    this.name = name
    this.relationship = relationship
  }
  toString() {
    return `{
      name: ${this.name},
      relationship: ${Relationship[this.relationship]},
    }`;
  }
}

export enum QueryError {
  UNKNOWN_QUERIER,
  UNKNOWN_UPDATER,
  PERSON_NOT_FOUND
}
export enum UpdateError {
  PERSON_NOT_FOUND,
  CHILD_ADDITION_FAILED,
  SPOUSE_NOT_FOUND,
  UNKNOWN_UPDATER
}
export enum UpdateResult {
  CHILD_ADDED,
  INLAW_ADDED,
}
