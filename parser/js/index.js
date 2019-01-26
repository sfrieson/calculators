const OPERATION = {
  ADD: (a, b) => a + b,
  DIV: (a, b) => a / b,
  EXP: (a, b) => Math.pow(a, b),
  MUL: (a, b) => a * b,
  SUB: (a, b) => a - b
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
  compose: (...fns) => fns.reduce((leftFn, rightFn) => (...args) => leftFn(rightFn(...args))),
  curry: (fn, ...vals) => (...rest) => fn(...vals, ...rest),
  makeTree: (left, value, right) => ({value, left, right}),
  removeWhitespace: x => x.split(RE.spaces).join(''),
  split: expression => expression.match(RE.split),
  stringToValue: str => operatorToOperation[str] || parseFloat(str)
};

function arrToAST (expression) {
  const left = expression.shift();
  const operation = expression.shift();
  const right = expression.shift();
  const tree = UTIL.makeTree(left, operation, right);

  if (expression.length === 0) return tree;
  else return arrToAST([tree, ...expression]);
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
