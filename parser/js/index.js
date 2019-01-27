const OPERATION = {
  ADD: (a, b) => a + b,
  DIV: (a, b) => a / b,
  EXP: (a, b) => Math.pow(a, b),
  MUL: (a, b) => a * b,
  SUB: (a, b) => a - b
};

const OPERATOR_VALUE = {
  [OPERATION.ADD]: 1,
  [OPERATION.DIV]: 2,
  [OPERATION.EXP]: 4,
  [OPERATION.MUL]: 3,
  [OPERATION.SUB]: 0
};

const ASSOCIATION = {
  LEFT: 'left',
  RIGHT: 'right'
};

const OPERATOR_ASSOCIATION = {
  [OPERATION.ADD]: ASSOCIATION.LEFT,
  [OPERATION.DIV]: ASSOCIATION.LEFT,
  [OPERATION.EXP]: ASSOCIATION.RIGHT,
  [OPERATION.MUL]: ASSOCIATION.LEFT,
  [OPERATION.SUB]: ASSOCIATION.LEFT
};

const operatorToOperation = {
  '+': OPERATION.ADD,
  '÷': OPERATION.DIV,
  '/': OPERATION.DIV,
  '^': OPERATION.EXP,
  '×': OPERATION.MUL,
  '*': OPERATION.MUL,
  '−': OPERATION.SUB, // Different minus character
  '-': OPERATION.SUB,
  '(': '(',
  ')': ')'
};

const RE = {
  spaces: /\s+/g,
  operatorOrOperand: /(?:[+\-*/^()])|(?:\d+)/g
};

const BRACKET = {
  LEFT: '(',
  RIGHT: ')'
};

class List {
  constructor (arr) {
    this.data = arr || [];
  }

  isEmpty () {
    return this.data.length <= 0;
  }

  toArray () {
    return this.data;
  }
}

class Queue extends List {
  pop () {
    return this.data.pop();
  }

  add (val) {
    this.data.unshift(val);
  }

  * [Symbol.iterator] () {
    while (!this.isEmpty()) yield this.pop();
    return this;
  }
}

class Stack extends List {
  pop () {
    return this.data.pop();
  }

  push (val) {
    this.data.push(val);
  }

  peek () {
    return this.data.slice(-1)[0];
  }

  * [Symbol.iterator] () {
    while (!this.isEmpty()) yield this.pop();
    return this;
  }
}

const UTIL = {
  compareOperators: (a, b) => OPERATOR_VALUE[a] > OPERATOR_VALUE[b] ? 1 : OPERATOR_VALUE[a] < OPERATOR_VALUE[b] ? -1 : 0,
  compose: (...fns) => fns.reduce((leftFn, rightFn) => (...args) => leftFn(rightFn(...args))),
  getOperatorAssociation: a => OPERATOR_ASSOCIATION[a],
  isNumber: o => typeof o === 'number',
  isOperator: o => o in OPERATOR_VALUE,
  removeWhitespace: x => x.split(RE.spaces).join(''),
  split: expression => expression.match(RE.operatorOrOperand),
  stringToValue: str => operatorToOperation[str] || parseFloat(str)
};

function shuntingYard (expression) {
  // without functions
  expression = new Queue(expression.reverse());
  const output = new Queue();
  const operatorStack = new Stack();

  for (let token of expression) {
    if (UTIL.isNumber(token)) output.add(token);
    if (UTIL.isOperator(token)) {
      while (
        !operatorStack.isEmpty() &&
        (
          UTIL.compareOperators(operatorStack.peek(), token) === 1 ||
          (
            UTIL.compareOperators(operatorStack.peek(), token) === 0 &&
            UTIL.getOperatorAssociation(operatorStack.peek()) === ASSOCIATION.LEFT
          )
        ) &&
        operatorStack.peek() !== BRACKET.LEFT
      ) output.add(operatorStack.pop());

      operatorStack.push(token);
    }
    if (token === BRACKET.LEFT) operatorStack.push(token);
    if (token === BRACKET.RIGHT) {
      while (operatorStack.peek() !== BRACKET.LEFT) output.add(operatorStack.pop());
      operatorStack.pop();
    }
    if (expression.isEmpty()) {
      for (let pop of operatorStack) output.add(pop);
    }
  }

  return output;
}

function evaluateRPN (expressionQueue) {
  var stack = new Stack();
  for (let token of expressionQueue) {
    if (UTIL.isOperator(token)) {
      const operand2 = stack.pop();
      const operand1 = stack.pop();
      const result = token(operand1, operand2);
      stack.push(result);
    } else if (UTIL.isNumber(token)) stack.push(token);
  }
  return stack.pop();
}

const compute = UTIL.compose(
  evaluateRPN,
  shuntingYard,
  vals => vals.map(UTIL.stringToValue),
  UTIL.split,
  UTIL.removeWhitespace
);

module.exports = {
  OPERATION,
  UTIL,
  compute,
  evaluateRPN,
  shuntingYard
};
