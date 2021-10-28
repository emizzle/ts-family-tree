import test from 'ava'

import { Female, Male } from '../../src/common'
import Tree from '../../src/tree/tree'

test.beforeEach((t) => {
  t.context = new Tree()
})
test('findRecursive - mother is undefined, returns undefined', async (t) => {
  const mother = undefined
  const result = Tree.findRecursive(mother, (_) => 1 === 1)
  t.is(result, undefined)
})
test('findRecursive - mother has no children, returns undefined', async (t) => {
  const mother = new Female('Test')
  const result = Tree.findRecursive(mother, (_) => 1 === 1)
  t.is(result, undefined)
})
test("findRecursive - mother has children, but can't find it", async (t) => {
  const mother = new Female('Mother')
  const child1 = new Male('Child1')
  const child2 = new Male('Child2')
  const child3 = new Female('Child3')
  mother.children = [child1, child2, child3]
  const result = Tree.findRecursive(mother, (c) => c.name === 'DoesntExist')
  t.is(result, undefined)
})
test('findRecursive - return direct descendent', async (t) => {
  const mother = new Female('Mother')
  const child1 = new Male('Child1')
  const child2 = new Male('Child2')
  const child3 = new Female('Child3')
  mother.children = [child1, child2, child3]
  const result = Tree.findRecursive(mother, (c) => c.name === child2.name)
  t.not(result, undefined)
  t.is(result?.child, child2)
  t.not(result?.child, child1)
  t.not(result?.child, child3)
})
test('findRecursive - return second descendent', async (t) => {
  const mother = new Female('Mother')
  const child1 = new Male('Child1')
  const child2 = new Male('Child2')
  const child3 = new Female('Child3')
  const grandchild1 = new Male('Grandchild1')
  const grandchild2 = new Female('Grandchild2')
  const grandchild3 = new Male('Grandchild3')
  child3.children = [grandchild1, grandchild2, grandchild3]
  mother.children = [child1, child2, child3]
  const result = Tree.findRecursive(mother, (c) => c.name === grandchild2.name)
  t.not(result, undefined)
  t.is(result?.child, grandchild2)
  t.not(result?.child, child1)
  t.not(result?.child, child3)
  t.not(result?.child, grandchild1)
  t.not(result?.child, grandchild3)
})
test("findRecursive - mother has grandchildren but can't find it", async (t) => {
  const mother = new Female('Mother')
  const child1 = new Male('Child1')
  const child2 = new Male('Child2')
  const child3 = new Female('Child3')
  const grandchild1 = new Male('Grandchild1')
  const grandchild2 = new Female('Grandchild2')
  const grandchild3 = new Male('Grandchild3')
  child3.children = [grandchild1, grandchild2, grandchild3]
  mother.children = [child1, child2, child3]
  const result = Tree.findRecursive(mother, (c) => c.name === 'DoesntExist')
  t.is(result, undefined)
})
test('findRecursive - return 10th descendent', async (t) => {
  let mother = new Female('Mother')
  const motherCopy = mother
  function birthChild(mother: Female, level: number) {
    const child = new Female('Child_' + level)
    mother.children = [child]
    return { mother: child }
  }
  for (let i = 0; i < 10; i++) {
    ;({ mother } = birthChild(mother, i))
  }
  const result = Tree.findRecursive(motherCopy, (c) => c.name === 'Child_9')
  t.not(result, undefined)
  t.assert(result?.child instanceof Female)
})
test('constructor - should have two members (king and queen)', (t) => {
  let tree = t.context as Tree
  t.is(tree.members.length, 2)
})
test('find - should have king and queen', (t) => {
  let tree = t.context as Tree
  const result = tree.find((p) => p.name === 'Queen')
  t.not(result, undefined)
  if (result !== undefined) {
    // make typechecker happy
    const { child } = result
    t.not(child, undefined)
    t.assert(child instanceof Female)
    const queen = <Female>child
    t.not(queen?.husband, undefined)
    t.is(queen?.husband?.name, 'King')
  }
})
