const assert = require('assert');
const { OPERATION, UTIL, shuntingYard, evaluateRPN, compute } = require('./');

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
  assert(UTIL.compareOperators(OPERATION.ADD, OPERATION.ADD) === 0, 'compareOperators, + +');
  assert(UTIL.compareOperators(OPERATION.MUL, OPERATION.ADD) === 1, 'compareOperators, * +');
  assert(UTIL.compareOperators(OPERATION.ADD, OPERATION.MUL) === -1, 'compareOperators, + *');
  assert(UTIL.isNumber(5) === true, 'isNumber, 5');
  assert(UTIL.isNumber(1e3) === true, 'isNumber, 1e3');
  assert(UTIL.isNumber('foo') === false, 'isNumber, `foo`');
  assert(UTIL.isOperator(OPERATION.ADD) === true, 'isOperator, +');
  assert(UTIL.isOperator('foo') === false, 'isOperator, `foo`');
  assert(UTIL.getOperatorAssociation(OPERATION.ADD) === 'left', 'getOperatorAssociation, +');
  assert(UTIL.removeWhitespace(' a bc  d e f  ') === 'abcdef', 'removeWhitespace');
  assert(UTIL.split('23*52+(8*(5-3))').join() === '23,*,52,+,(,8,*,(,5,-,3,),)', 'split');
  assert(UTIL.stringToValue('23') === 23, 'stringToValue(`23`)');
  assert(UTIL.stringToValue('+') === OPERATION.ADD, 'stringToValue(`+`)');
});

test('shuntingYard', function () {
  // 3 + 4 × 2 ÷ ( 1 − 5 ) ^ 2 ^ 3
  const result = shuntingYard([
    3, OPERATION.ADD, 4, OPERATION.MUL, 2, OPERATION.DIV, '(', 1, OPERATION.SUB, 5, ')', OPERATION.EXP, 2, OPERATION.EXP, 3
  ]).toArray().reverse();
  // 3 4 2 × 1 5 − 2 3 ^ ^ ÷ +
  const expected = [
    3, 4, 2, OPERATION.MUL, 1, 5, OPERATION.SUB, 2, 3, OPERATION.EXP, OPERATION.EXP, OPERATION.DIV, OPERATION.ADD
  ];

  for (var i = 0; i < expected.length; i++) {
    assert(result[i] === expected[i], 'oops');
  }
});

test('evaluateRPN', function () {
  const result = evaluateRPN(
    shuntingYard([
      3, OPERATION.ADD, 4, OPERATION.MUL, 2, OPERATION.DIV, '(', 1, OPERATION.SUB, 5, ')', OPERATION.EXP, 2, OPERATION.EXP, 3
    ])
  );

  assert(Math.round(result) === Math.round(3.001953125), 'depends on shuntingYard');
});

test('compute', function () {
  assert(compute('((15 / (7 - (1 + 1))) * 3) - (2 + (1 + 1))') === 5, 'computation failure');
});
