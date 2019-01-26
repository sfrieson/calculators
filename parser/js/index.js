const OPERATION = {
  ADD: (a, b) => a + b,
  DIV: (a, b) => a / b,
  EXP: (a, b) => Math.pow(a, b),
  MUL: (a, b) => a * b,
  SUB: (a, b) => a - b
};

const OPERATOR_VALUE = {
  [OPERATION.EXP]: 4,
  [OPERATION.MUL]: 3,
  [OPERATION.DIV]: 2,
  [OPERATION.ADD]: 1,
  [OPERATION.SUB]: 0
};

const operatorToOperation = {
  '+': OPERATION.ADD,
  '/': OPERATION.DIV,
  '^': OPERATION.EXP,
  '*': OPERATION.MUL,
  '-': OPERATION.SUB,
  '(': '(',
  ')': ')'
};

const RE = {
  spaces: /\s+/g,
  number: /\d+/,
  operator: /[+\-*/]/,
  split: /(?:[+\-*/^()])|(?:\d+)/g
};

const UTIL = {
  compareOperators: (a, b) => OPERATOR_VALUE[a] >= OPERATOR_VALUE[b] ? 1 : -1,
  compose: (...fns) => fns.reduce((leftFn, rightFn) => (...args) => leftFn(rightFn(...args))),
  curry: (fn, ...vals) => (...rest) => fn(...vals, ...rest),
  isNumber: o => o === parseFloat(o),
  isOperator: o => o in OPERATOR_VALUE,
  isTree: x => typeof x === 'object',
  makeTree: (left, value, right) => ({value, left, right}),
  removeWhitespace: x => x.split(RE.spaces).join(''),
  split: expression => expression.match(RE.split),
  stringToValue: str => operatorToOperation[str] || parseFloat(str)
};

function arrToAST (expression) {
  if (!expression || expression.length === 0) throw Error('Bad expression: ' + expression);
  let left, operator, right, next, comparison, tree;
  next = expression.shift();
  if (expression.length === 0) return next;

  left = next;
  next = expression.shift();

  if (UTIL.isOperator(next)) {
    operator = next;
    if (UTIL.isTree(left)) {
      comparison = UTIL.compareOperators(left.value, operator);
      if (comparison === -1) {
        const newLeft = left.right;
        expression = [newLeft, operator, ...expression];
        left.right = arrToAST(expression);
        return arrToAST([left, ...expression]);
      } else { /* continue */ }
    } else { /* continue */ }
  }

  if (right === undefined) {
    next = expression.shift();
    if (UTIL.isNumber(next)) right = next;
  }

  tree = UTIL.makeTree(left, operator, right);

  if (expression.length === 0) return tree;
  return arrToAST([tree, ...expression]);
}

const parse = UTIL.compose(
  arrToAST,
  vals => vals.map(UTIL.stringToValue),
  UTIL.split,
  UTIL.removeWhitespace
);

module.exports = {
  OPERATION,
  UTIL,
  parse,
  arrToAST
};
