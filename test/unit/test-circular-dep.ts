import test from 'ava'
import {
  Female,
  Male,
  AddChildCommand,
  Gender,
  AddInlawCommand,
  QueryCommand,
} from '../../src/common'
import Tree from '../../src/tree/tree'
import AddChildUpdater from '../../src/tree/updater/add_child'
import AddInlawUpdater from '../../src/tree/updater/add_inlaw'

test('circular dependency, no tree', (t) => {
  const mother = new Female('Mother')
  const father = new Male('Father')
  mother.husband = father
  father.wife = mother

  t.is(mother.husband, father)
  t.is(father.wife, mother)
})

test('circular dependency, in memory', (t) => {
  const mother = new Female('Mother')
  const father = new Male('Father')
  mother.husband = father
  father.wife = mother

  const daughter = new Female('Daughter')
  const granddaughter = new Female('Granddaugher')
  daughter.children.push(granddaughter)
  mother.children.push(daughter)

  const husbandToDaughter = new Male('HusbandToDaughter')
  daughter.husband = husbandToDaughter
  husbandToDaughter.wife = daughter

  t.is(daughter.husband, husbandToDaughter)
  t.is(husbandToDaughter.wife, daughter)
  t.is(mother.husband, father)
  t.is(father.wife, mother)
})
test('circular dependency, finding in tree', (t) => {
  const mother = new Female('Mother')
  const father = new Male('Father')
  mother.husband = father
  father.wife = mother

  const daughter = new Female('Daughter')
  const granddaughter = new Female('Granddaugher')
  const husbandToDaughter = new Male('HusbandToDaughter', true)

  daughter.children.push(granddaughter)
  mother.children.push(daughter)
  mother.children.push(husbandToDaughter)

  daughter.husband = husbandToDaughter
  husbandToDaughter.wife = daughter

  let tree = new Tree()
  tree.members = [mother, father]
  const foundDaughter = tree.findByName('Daughter')
  const foundHusbandToDaughter = tree.findByName('HusbandToDaughter')
  t.not(foundDaughter, undefined)
  t.not(foundHusbandToDaughter, undefined)
  if (foundDaughter !== undefined && foundHusbandToDaughter !== undefined) {
    // make type checker happy
    const daughter = <Female>foundDaughter.child
    const hubandToDaughter = <Male>foundHusbandToDaughter.child

    t.is(daughter.husband, hubandToDaughter)
    t.is(hubandToDaughter.wife, daughter)
    t.is(daughter.children.length, 1)
  }
})
test('circular dependency, integration test', (t) => {
  const tree = new Tree()
  const childUpdater = new AddChildUpdater(tree)
  const inlawUpdater = new AddInlawUpdater(tree)
  const addMother = new AddChildCommand('Queen', 'Mother', Gender.Female)
  const addFather = new AddInlawCommand('Queen', 'Father', 'Mother', Gender.Male)

  childUpdater.update(addMother)
  inlawUpdater.update(addFather)

  const foundMother = tree.findByName('Mother')
  const foundFather = tree.findByName('Father')
  t.not(foundMother, undefined)
  t.not(foundFather, undefined)
  if (foundMother !== undefined && foundFather !== undefined) {
    // make type checker happy
    const mother = <Female>foundMother.child
    const father = <Male>foundFather.child

    t.not(mother.husband, undefined)
    t.not(father.wife, undefined)
    t.is(mother.husband, father)
    t.is(father.wife, mother)
  }
})
