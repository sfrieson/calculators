const assert = require('assert');
const { OPERATION, UTIL, arrToAST, parse } = require('./');

function test (name, tests) {
  try {
    tests();
    console.log(`${name} Pass`);
  } catch (e) {
    console.log(`${name} Failure:`, e.message);
  }
}

test('Operation', function () {
  assert(OPERATION.ADD(3, 2) === 5, 'add');
  assert(OPERATION.DIV(3, 2) === 1.5, 'divide');
  assert(OPERATION.EXP(3, 2) === 9, 'exponent');
  assert(OPERATION.MUL(3, 2) === 6, 'multiply');
  assert(OPERATION.SUB(3, 2) === 1, 'subtract');
});

test('Util', function () {
  assert(
    (UTIL.compose(
      x => x + 2,
      x => x + 'D',
      x => x + '-',
      x => x + 2
    ))('R') === 'R2-D2',
    'compose'
  );
  assert(
    (UTIL.curry(
      (a, b, c) => a + b + c,
      2, 2
    ))(2) === 6,
    'curry'
  );
  assert(UTIL.removeWhitespace(' a bc  d e f  ') === 'abcdef', 'removeWhitespace');
  assert(UTIL.split('23*52+(8*(5-3))').join() === '23,*,52,+,(,8,*,(,5,-,3,),)', 'split');
  assert(UTIL.stringToValue('23') === 23, 'stringToValue(`23`)');
  assert(UTIL.stringToValue('+') === OPERATION.ADD, 'stringToValue(`+`)');

  let tree = UTIL.makeTree('1', '+', '2');
  assert(tree.left === '1', 'makeTree, left');
  assert(tree.value === '+', 'makeTree, value');
  assert(tree.right === '2', 'makeTree, right');
});

test('arrToAST', function () {
  let tree = arrToAST([1, OPERATION.ADD, 2]);
  assert(tree.left === 1, 'arrToAST, 1 + 2, left');
  assert(tree.value === OPERATION.ADD, 'arrToAST, 1 + 2, value');
  assert(tree.right === 2, 'arrToAST, 1 + 2, right');

  tree = arrToAST([1, OPERATION.ADD, 2, OPERATION.ADD, 3]);
  assert(typeof tree.left === 'object', 'arrToAST, 1 + 2 + 3, left');
  assert(tree.value === OPERATION.ADD, 'arrToAST, 1 + 2 + 3, value');
  assert(tree.right === 3, 'arrToAST, 1 + 2 + 3, right');
  let left = tree.left;
  assert(left.left === 1, 'arrToAST, 1 + 2 + 3, left.left');
  assert(left.value === OPERATION.ADD, 'arrToAST, 1 + 2 + 3, left.value');
  assert(left.right === 2, 'arrToAST, 1 + 2 + 3, left.right');

  tree = arrToAST([1, OPERATION.ADD, 2, OPERATION.MUL, 3]);
  assert(tree.left === 1, 'arrToAST, 1 + 2 * 3, left');
  assert(tree.value === OPERATION.ADD, 'arrToAST, 1 + 2 * 3, value');
  assert(typeof tree.right === 'object', 'arrToAST, 1 + 2 * 3, right');
  let right = tree.right;
  assert(right.left === 2, 'arrToAST, 1 + 2 * 3, right.left');
  assert(right.value === OPERATION.MUL, 'arrToAST, 1 + 2 * 3, right.value');
  assert(right.right === 3, 'arrToAST, 1 + 2 * 3, right.right');
});
