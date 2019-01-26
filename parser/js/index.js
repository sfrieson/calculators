const OPERATION = {
  ADD: (a, b) => a + b,
  DIV: (a, b) => a / b,
  EXP: (a, b) => Math.pow(a, b),
  MUL: (a, b) => a * b,
  PAR: a => a(),
  SUB: (a, b) => a - b
};

const OPERATOR_VALUE = {
  [OPERATION.EXP]: 4,
  [OPERATION.MUL]: 3,
  [OPERATION.DIV]: 2,
  [OPERATION.ADD]: 1,
  [OPERATION.SUB]: 0
};

const OPERATOR_ASSOCIATION = {
  [OPERATION.EXP]: 'right',
  [OPERATION.EXP]: 'left',
  [OPERATION.MUL]: 'left',
  [OPERATION.DIV]: 'left',
  [OPERATION.ADD]: 'left',
  [OPERATION.SUB]: 'left'
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
}

const UTIL = {
  compareOperators: (a, b) => OPERATOR_VALUE[a] > OPERATOR_VALUE[b] ? 1 : OPERATOR_VALUE[a] < OPERATOR_VALUE[b] ? -1 : 0,
  compose: (...fns) => fns.reduce((leftFn, rightFn) => (...args) => leftFn(rightFn(...args))),
  getOperatorAssociation: a => OPERATOR_ASSOCIATION[a],
  isNumber: o => typeof o === 'number',
  isOperator: o => o in OPERATOR_VALUE,
  removeWhitespace: x => x.split(RE.spaces).join(''),
  split: expression => expression.match(RE.split),
  stringToValue: str => operatorToOperation[str] || parseFloat(str)
};

function shuntingYard (expression) {
  // without functions
  expression = new Queue(expression.reverse());
  const output = new Queue();
  const operatorStack = new Stack();

  while (!expression.isEmpty()) {
    let token = expression.pop();
    if (UTIL.isNumber(token)) {
      output.add(token);
    }
    if (UTIL.isOperator(token)) {
      while (
        !operatorStack.isEmpty() &&
        (
          UTIL.compareOperators(operatorStack.peek(), token) === 1 ||
          (
            UTIL.compareOperators(operatorStack.peek(), token) === 0 &&
            UTIL.getOperatorAssociation(operatorStack.peek() === 'left')
          )
        ) &&
        operatorStack.peek() !== '('
      ) output.add(operatorStack.pop());

      operatorStack.push(token);
    }
    if (token === '(') operatorStack.push(token);
    if (token === ')') {
      while (operatorStack.peek() !== '(') output.add(operatorStack.pop());
      operatorStack.pop();
    }
    if (expression.isEmpty()) {
      while (!operatorStack.isEmpty()) output.add(operatorStack.pop());
    }
  }

  return output;
}

function evaluateRPN (expressionQueue) {
  var stack = new Stack();
  while (!expressionQueue.isEmpty()) {
    var token = expressionQueue.pop();
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
