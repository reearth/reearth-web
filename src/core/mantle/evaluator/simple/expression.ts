import { defined, Math as CesiumMath } from "cesium";
import jsep from "jsep";
import { JSONPath } from "jsonpath-plus";
import * as randomWords from "random-words";

import {
  Feature,
  BinaryFunction,
  UnaryFunction,
  ConditionsExpression,
  JPLiteral,
} from "../../types";

import {
  unaryOperators,
  binaryOperators,
  variableRegex,
  backslashRegex,
  backslashReplacement,
  replacementRegex,
  ExpressionNodeType,
} from "./constants";

export class ConditionalExpression {
  _conditions: [string, string][];
  _runtimeConditions: Statement[];
  _feature?: Feature;

  constructor(conditionsExpression: ConditionsExpression, feature?: Feature, defines?: any) {
    this._conditions = conditionsExpression.conditions;
    this._runtimeConditions = [];
    this._feature = feature;

    this.setRuntime(defines);
  }

  setRuntime(defines: any) {
    const runtimeConditions = [];
    const conditions = this._conditions;
    if (!defined(conditions)) {
      return;
    }
    const length = conditions.length;
    for (let i = 0; i < length; i++) {
      const statement = conditions[i];
      const cond = String(statement[0]);
      const condExpression = String(statement[1]);
      runtimeConditions.push(
        new Statement(
          new Expression(cond, this._feature, defines),
          new Expression(condExpression, this._feature, defines),
        ),
      );
    }
    this._runtimeConditions = runtimeConditions;
  }

  evaluate() {
    const conditions = this._runtimeConditions;
    if (defined(conditions)) {
      const length = conditions.length;
      for (let i = 0; i < length; ++i) {
        const statement = conditions[i];
        if (statement.condition.evaluate()) {
          return statement.expression.evaluate();
        }
      }
    }
    return undefined;
  }
}

class Statement {
  condition: Expression;
  expression: Expression;
  constructor(condition: Expression, expression: Expression) {
    this.condition = condition;
    this.expression = expression;
  }
}

export class Expression {
  _expression: string;
  _runtimeAst: Node | Error;
  _feature?: Feature;

  constructor(expression: string, feature?: Feature, defines?: any) {
    this._expression = expression;
    this._feature = feature;
    let literalJP: JPLiteral[] = [];
    expression = replaceDefines(expression, defines);
    [expression, literalJP] = replaceVariables(removeBackslashes(expression), this._feature);

    if (literalJP.length !== 0) {
      for (const elem of literalJP) {
        jsep.addLiteral(elem.literalName, elem.literalValue);
      }
    }

    // customize jsep operators
    jsep.addBinaryOp("=~", 0);
    jsep.addBinaryOp("!~", 0);

    let ast;
    try {
      ast = jsep(expression);
    } catch (e) {
      throw new Error(`failed to generate ast: ${e}`);
    }

    this._runtimeAst = createRuntimeAst(this, ast);
  }

  evaluate() {
    const value = (this._runtimeAst as Node).evaluate(this._feature);
    return value;
  }
}

export function replaceDefines(expression: string, defines: any): string {
  if (!defined(defines)) {
    return expression;
  }
  for (const key in defines) {
    const definePlaceholder = new RegExp(`\\$\\{${key}\\}`, "g");
    const defineReplace = `(${defines[key]})`;
    if (defined(defineReplace)) {
      expression = expression.replace(definePlaceholder, defineReplace);
    }
  }
  return expression;
}

export function removeBackslashes(expression: string): string {
  return expression.replace(backslashRegex, backslashReplacement);
}

export function replaceBackslashes(expression: string): string {
  return expression.replace(replacementRegex, "\\");
}

export function replaceVariables(expression: string, feature?: Feature): [string, JPLiteral[]] {
  let exp = expression;
  let result = "";
  const literalJP: JPLiteral[] = [];
  let i = exp.indexOf("${");
  while (i >= 0) {
    if (isInsideQuotes(exp, i)) {
      const closeQuote =
        exp.indexOf("'") >= 0
          ? exp.indexOf("'", exp.indexOf("'") + 1)
          : exp.indexOf('"', exp.indexOf('"') + 1);
      result += exp.substring(0, closeQuote + 1);
      exp = exp.substring(closeQuote + 1);
      i = exp.indexOf("${");
    } else {
      result += exp.substring(0, i);
      const j = getCloseBracketIndex(exp, i);
      const varExp = exp.substring(i + 2, j);
      if (varExp.substring(0, 2) === "$.") {
        if (!defined(feature)) {
          throw new Error(`replaceVariable: features need to be defined for JSONPath`);
        }
        if (containsValidJSONPath(varExp, feature as Feature)) {
          const res = JSONPath({ json: feature as Feature, path: varExp });
          if (res.length == 1) {
            const placeholderLiteral = generateRandomLiteralWords();
            literalJP.push({
              literalName: placeholderLiteral,
              literalValue: res[0],
            });
            result += placeholderLiteral;
          } else if (res.length < 1) {
            throw new Error(`replaceVariable: ${varExp} gives none`);
          } else {
            throw new Error(`replaceVariable: ${varExp} should give only one result`);
          }
        } else {
          throw new Error(`replaceVariable: ${varExp} is not a valid JSONPath`);
        }
      } else {
        result += `czm_${varExp}`;
      }
      exp = exp.substring(j + 1);
      i = exp.indexOf("${");
    }
  }
  result += exp;
  return [result, literalJP];
}

function generateRandomLiteralWords() {
  return randomWords.default({ exactly: 5, join: "" });
}

function containsValidJSONPath(expression: string, feature: Feature): boolean {
  try {
    JSONPath({ json: feature, path: expression });
    return true;
  } catch (error) {
    return false;
  }
}

function isInsideQuotes(exp: string, index: number): boolean {
  const openSingleQuote = exp.indexOf("'");
  const openDoubleQuote = exp.indexOf('"');
  if (openSingleQuote >= 0 && openSingleQuote < index) {
    const closeQuote = exp.indexOf("'", openSingleQuote + 1);
    return closeQuote >= index;
  } else if (openDoubleQuote >= 0 && openDoubleQuote < index) {
    const closeQuote = exp.indexOf('"', openDoubleQuote + 1);
    return closeQuote >= index;
  }
  return false;
}

function getCloseBracketIndex(exp: string, openBracketIndex: number): number {
  const j = exp.indexOf("}", openBracketIndex);
  if (j < 0) {
    throw new Error(`replaceVariable: Unmatched {.`);
  }
  return j;
}

function createRuntimeAst(expression: Expression, ast: any): Node | Error {
  let node: Node | Error = new Error("failed to parse");
  let op;
  let left;
  let right;

  if (ast.type === "Literal") {
    node = parseLiteral(ast);
  } else if (ast.type === "CallExpression") {
    node = parseCall(expression, ast);
  } else if (ast.type === "Identifier") {
    node = parseKeywordsAndVariables(ast);
  } else if (ast.type === "UnaryExpression") {
    op = ast.operator;
    const child = createRuntimeAst(expression, ast.argument);
    if (unaryOperators.indexOf(op) > -1) {
      node = new Node(ExpressionNodeType.UNARY, op, child);
    } else {
      throw new Error(`Unexpected operator "${op}".`);
    }
  } else if (ast.type === "BinaryExpression") {
    op = ast.operator;
    left = createRuntimeAst(expression, ast.left);
    right = createRuntimeAst(expression, ast.right);
    if (binaryOperators.indexOf(op) > -1) {
      node = new Node(ExpressionNodeType.BINARY, op, left, right);
    } else {
      throw new Error(`Unexpected operator "${op}".`);
    }
  } else if (ast.type === "LogicalExpression") {
    op = ast.operator;
    left = createRuntimeAst(expression, ast.left);
    right = createRuntimeAst(expression, ast.right);
    if (binaryOperators.indexOf(op) > -1) {
      node = new Node(ExpressionNodeType.BINARY, op, left, right);
    }
  } else if (ast.type === "ConditionalExpression") {
    const test = createRuntimeAst(expression, ast.test);
    left = createRuntimeAst(expression, ast.consequent);
    right = createRuntimeAst(expression, ast.alternate);
    node = new Node(ExpressionNodeType.CONDITIONAL, "?", left, right, test);
  } else if (ast.type === "MemberExpression") {
    node = parseMemberExpression(expression, ast);
  } else if (ast.type === "ArrayExpression") {
    const val = [];
    for (let i = 0; i < ast.elements.length; i++) {
      val[i] = createRuntimeAst(expression, ast.elements[i]);
    }
    node = new Node(ExpressionNodeType.ARRAY, val);
  } else if (ast.type === "Compound") {
    // empty expression or multiple expressions
    throw new Error("Provide exactly one expression.");
  } else {
    throw new Error("Cannot parse expression.");
  }

  return node;
}

function parseLiteral(ast: any): Node | Error {
  const type = typeof ast.value;
  if (ast.value === null) {
    return new Node(ExpressionNodeType.LITERAL_NULL, null);
  } else if (type === "boolean") {
    return new Node(ExpressionNodeType.LITERAL_BOOLEAN, ast.value);
  } else if (type === "number") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, ast.value);
  } else if (type === "string") {
    if (ast.value.indexOf("${") >= 0) {
      return new Node(ExpressionNodeType.VARIABLE_IN_STRING, ast.value);
    }
    return new Node(ExpressionNodeType.LITERAL_STRING, replaceBackslashes(ast.value));
  }

  throw new Error(`${ast} is not a function.`);
}

function parseCall(expression: Expression, ast: any): Node | Error {
  const args = ast.arguments;
  const argsLength = args.length;
  let call;
  let val, left, right;

  // Member function calls
  if (ast.callee.type === "MemberExpression") {
    call = ast.callee.property.name;
    const object = ast.callee.object;
    if (call === "test" || call === "exec") {
      // Make sure this is called on a valid type
      if (object.callee.name !== "regExp") {
        throw new Error(`${call} is not a function.`);
      }
      if (argsLength === 0) {
        if (call === "test") {
          return new Node(ExpressionNodeType.LITERAL_BOOLEAN, false);
        }
        return new Node(ExpressionNodeType.LITERAL_NULL, null);
      }
      left = createRuntimeAst(expression, object);
      right = createRuntimeAst(expression, args[0]);
      return new Node(ExpressionNodeType.FUNCTION_CALL, call, left, right);
    } else if (call === "toString") {
      val = createRuntimeAst(expression, object);
      return new Node(ExpressionNodeType.FUNCTION_CALL, call, val);
    }

    throw new Error(`Unexpected function call "${call}".`);
  }

  // Non-member function calls
  call = ast.callee.name;
  if (call === "isNaN" || call === "isFinite") {
    if (argsLength === 0) {
      if (call === "isNaN") {
        return new Node(ExpressionNodeType.LITERAL_BOOLEAN, true);
      }
      return new Node(ExpressionNodeType.LITERAL_BOOLEAN, false);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (defined(unaryFunctions[call])) {
    if (argsLength !== 1) {
      throw new Error(`${call} requires exactly one argument.`);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (defined(binaryFunctions[call])) {
    if (argsLength !== 2) {
      throw new Error(`${call} requires exactly two arguments.`);
    }
    left = createRuntimeAst(expression, args[0]);
    right = createRuntimeAst(expression, args[1]);
    return new Node(ExpressionNodeType.BINARY, call, left, right);
  } else if (call === "Boolean") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_BOOLEAN, false);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (call === "Number") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_NUMBER, 0);
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  } else if (call === "String") {
    if (argsLength === 0) {
      return new Node(ExpressionNodeType.LITERAL_STRING, "");
    }
    val = createRuntimeAst(expression, args[0]);
    return new Node(ExpressionNodeType.UNARY, call, val);
  }

  throw new Error(`Unexpected function call "${call}".`);
}

function parseKeywordsAndVariables(ast: any): Node | Error {
  if (isVariable(ast.name)) {
    const name = getPropertyName(ast.name);
    if (name.substring(0, 8) === "tiles3d_") {
      return new Node(ExpressionNodeType.BUILTIN_VARIABLE, name);
    }
    return new Node(ExpressionNodeType.VARIABLE, name);
  } else if (ast.name === "NaN") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, NaN);
  } else if (ast.name === "Infinity") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Infinity);
  } else if (ast.name === "undefined") {
    return new Node(ExpressionNodeType.LITERAL_UNDEFINED, undefined);
  }

  throw new Error(`${ast.name} is not defined.`);
}

function parseMathConstant(ast: any) {
  const name = ast.property.name;
  if (name === "PI") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Math.PI);
  } else if (name === "E") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Math.E);
  }

  throw new Error(`${name} Math Constant is not supported at the moment`);
}

function parseNumberConstant(ast: any) {
  const name = ast.property.name;
  if (name === "POSITIVE_INFINITY") {
    return new Node(ExpressionNodeType.LITERAL_NUMBER, Number.POSITIVE_INFINITY);
  }
  throw new Error(`${name} Number Constant is not supported at the moment`);
}

function parseMemberExpression(expression: Expression, ast: any) {
  if (ast.object.name === "Math") {
    return parseMathConstant(ast);
  } else if (ast.object.name === "Number") {
    return parseNumberConstant(ast);
  }

  let val;
  const obj = createRuntimeAst(expression, ast.object);
  if (ast.computed) {
    val = createRuntimeAst(expression, ast.property);
    return new Node(ExpressionNodeType.MEMBER, "brackets", obj, val);
  }

  val = new Node(ExpressionNodeType.LITERAL_STRING, ast.property.name);
  return new Node(ExpressionNodeType.MEMBER, "dot", obj, val);
}

export function checkFeature(ast: any): boolean {
  return ast._value === "feature";
}

const unaryFunctions: { [key: string]: UnaryFunction } = {
  abs: getEvaluateUnaryComponentwise(Math.abs),
  sqrt: getEvaluateUnaryComponentwise(Math.sqrt),
  cos: getEvaluateUnaryComponentwise(Math.cos),
  sin: getEvaluateUnaryComponentwise(Math.sin),
  tan: getEvaluateUnaryComponentwise(Math.tan),
  acos: getEvaluateUnaryComponentwise(Math.acos),
  asin: getEvaluateUnaryComponentwise(Math.asin),
  atan: getEvaluateUnaryComponentwise(Math.atan),
  radians: getEvaluateUnaryComponentwise(CesiumMath.toRadians),
  degrees: getEvaluateUnaryComponentwise(CesiumMath.toDegrees),
  sign: getEvaluateUnaryComponentwise(CesiumMath.sign),
  floor: getEvaluateUnaryComponentwise(Math.floor),
  ceil: getEvaluateUnaryComponentwise(Math.ceil),
  round: getEvaluateUnaryComponentwise(Math.round),
  exp: getEvaluateUnaryComponentwise(Math.exp),
  exp2: getEvaluateUnaryComponentwise(exp2),
  log: getEvaluateUnaryComponentwise(Math.log),
  log2: getEvaluateUnaryComponentwise(log2),
  fract: getEvaluateUnaryComponentwise(fract),
};

const binaryFunctions: { [key: string]: BinaryFunction } = {
  atan2: getEvaluateBinaryComponentwise(Math.atan2, false),
  pow: getEvaluateBinaryComponentwise(Math.pow, false),
  min: getEvaluateBinaryComponentwise(Math.min, true),
  max: getEvaluateBinaryComponentwise(Math.max, true),
};

function fract(number: number): number {
  return number - Math.floor(number);
}

function exp2(exponent: number): number {
  return Math.pow(2.0, exponent);
}

function log2(number: number): number {
  return CesiumMath.log2(number);
}

function getEvaluateUnaryComponentwise(operation: (value: number) => number): UnaryFunction {
  return function (call: any, left: any) {
    if (typeof left === "number") {
      return operation(left);
    }
    throw new Error(
      `Function "${call}" requires a vector or number argument. Argument is ${left}.`,
    );
  };
}

function getEvaluateBinaryComponentwise(operation: any, allowScalar: boolean): BinaryFunction {
  return function (call: any, left: any, right: any) {
    if (allowScalar && typeof right === "number") {
      if (typeof left === "number") {
        return operation(left, right);
      }
    }
    if (typeof left === "number" && typeof right === "number") {
      return operation(left, right);
    }

    throw new Error(
      `Function "${call}" requires vector or number arguments of matching types. Arguments are ${left} and ${right}.`,
    );
  };
}

export class Node {
  _type;
  _value;
  _left;
  _right;
  _test;
  evaluate: any;

  constructor(type: any, value: any, left?: any, right?: any, test?: any) {
    this._type = type;
    this._value = value;
    this._left = left;
    this._right = right;
    this._test = test;

    this.setEvaluateFunction();
  }

  setEvaluateFunction() {
    if (this._type === ExpressionNodeType.CONDITIONAL) {
      this.evaluate = this._evaluateConditional;
    } else if (this._type === ExpressionNodeType.FUNCTION_CALL) {
      if (this._value === "toString") {
        this.evaluate = this._evaluateToString;
      }
    } else if (this._type === ExpressionNodeType.UNARY) {
      if (this._value === "!") {
        this.evaluate = this._evaluateNot;
      } else if (this._value === "-") {
        this.evaluate = this._evaluateNegative;
      } else if (this._value === "+") {
        this.evaluate = this._evaluatePositive;
      } else if (this._value === "isNaN") {
        this.evaluate = this._evaluateNaN;
      } else if (this._value === "isFinite") {
        this.evaluate = this._evaluateIsFinite;
      } else if (this._value === "Boolean") {
        this.evaluate = this._evaluateBooleanConversion;
      } else if (this._value === "Number") {
        this.evaluate = this._evaluateNumberConversion;
      } else if (this._value === "String") {
        this.evaluate = this._evaluateStringConversion;
      } else if (defined(unaryFunctions[this._value as string])) {
        this.evaluate = getEvaluateUnaryFunction(this._value);
      }
    } else if (this._type === ExpressionNodeType.BINARY) {
      if (this._value === "+") {
        this.evaluate = this._evaluatePlus;
      } else if (this._value === "-") {
        this.evaluate = this._evaluateMinus;
      } else if (this._value === "*") {
        this.evaluate = this._evaluateTimes;
      } else if (this._value === "/") {
        this.evaluate = this._evaluateDivide;
      } else if (this._value === "%") {
        this.evaluate = this._evaluateMod;
      } else if (this._value === "===") {
        this.evaluate = this._evaluateEqualsStrict;
      } else if (this._value === "!==") {
        this.evaluate = this._evaluateNotEqualsStrict;
      } else if (this._value === "<") {
        this.evaluate = this._evaluateLessThan;
      } else if (this._value === "<=") {
        this.evaluate = this._evaluateLessThanOrEquals;
      } else if (this._value === ">") {
        this.evaluate = this._evaluateGreaterThan;
      } else if (this._value === ">=") {
        this.evaluate = this._evaluateGreaterThanOrEquals;
      } else if (this._value === "&&") {
        this.evaluate = this._evaluateAnd;
      } else if (this._value === "||") {
        this.evaluate = this._evaluateOr;
      } else if (defined(binaryFunctions[this._value])) {
        this.evaluate = getEvaluateBinaryFunction(this._value);
      }
    } else if (this._type === ExpressionNodeType.MEMBER) {
      if (this._value === "brackets") {
        this.evaluate = this._evaluateMemberBrackets;
      } else {
        this.evaluate = this._evaluateMemberDot;
      }
    } else if (this._type === ExpressionNodeType.ARRAY) {
      this.evaluate = this._evaluateArray;
    } else if (this._type === ExpressionNodeType.VARIABLE) {
      this.evaluate = this._evaluateVariable;
    } else if (this._type === ExpressionNodeType.VARIABLE_IN_STRING) {
      this.evaluate = this._evaluateVariableString;
    } else if (this._type === ExpressionNodeType.LITERAL_STRING) {
      this.evaluate = this._evaluateLiteralString;
    } else {
      this.evaluate = this._evaluateLiteral;
    }
  }

  _evaluateLiteral() {
    return this._value;
  }
  _evaluateLiteralString() {
    return this._value;
  }
  _evaluateVariableString(feature: Feature) {
    let result = this._value;
    let match = variableRegex.exec(result);
    while (match !== null) {
      const placeholder = match[0];
      const variableName = match[1];
      let property = feature.properties[variableName];
      if (!defined(property)) {
        property = "";
      }
      result = result.replace(placeholder, property);
      match = variableRegex.exec(result);
    }
    return result;
  }
  _evaluateVariable(feature: Feature) {
    if (String(this._value) in feature) {
      return feature[String(this._value)];
    }
  }
  _evaluateMemberDot(feature: Feature) {
    if (checkFeature(this._left)) {
      return feature[this._right.evaluate(feature)];
    }
    const property = this._left.evaluate(feature);
    if (!defined(property)) {
      return undefined;
    }

    const member = this._right.evaluate(feature);
    return property[member];
  }

  _evaluateMemberBrackets(feature: Feature) {
    if (checkFeature(this._left)) {
      return feature[this._right.evaluate(feature)];
    }
    const property = this._left.evaluate(feature);
    if (!defined(property)) {
      return undefined;
    }

    const member = this._right.evaluate(feature);
    return property[member];
  }
  _evaluateArray(feature: Feature) {
    const array = [];
    for (let i = 0; i < this._value.length; i++) {
      array[i] = this._value[i].evaluate(feature);
    }
    return array;
  }

  _evaluateNot(feature: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      throw new Error(`Operator "!" requires a boolean argument. Argument is ${left}.`);
    }
    return !left;
  }
  _evaluateNegative(feature: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left === "number") {
      return -left;
    }

    throw new Error(`Operator "-" requires a vector or number argument. Argument is ${left}.`);
  }
  _evaluatePositive(feature: Feature) {
    const left = this._left.evaluate(feature);

    if (!(typeof left === "number")) {
      throw new Error(`Operator "+" requires a vector or number argument. Argument is ${left}.`);
    }

    return left;
  }
  _evaluateLessThan(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator "<" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left < right;
  }
  _evaluateLessThanOrEquals(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator "<=" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left <= right;
  }
  _evaluateGreaterThan(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator ">" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left > right;
  }
  _evaluateGreaterThanOrEquals(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(
        `Operator ">=" requires number arguments. Arguments are ${left} and ${right}.`,
      );
    }

    return left >= right;
  }
  _evaluateOr(feature: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      throw new Error(`Operator "||" requires boolean arguments. First argument is ${left}.`);
    }

    // short circuit the expression
    if (left) {
      return true;
    }

    const right = this._right.evaluate(feature);
    if (typeof right !== "boolean") {
      throw new Error(`Operator "||" requires boolean arguments. Second argument is ${right}.`);
    }

    return left || right;
  }
  _evaluateAnd(feature: Feature) {
    const left = this._left.evaluate(feature);
    if (typeof left !== "boolean") {
      throw new Error(`Operator "&&" requires boolean arguments. First argument is ${left}.`);
    }

    // short circuit the expression
    if (!left) {
      return false;
    }

    const right = this._right.evaluate(feature);
    if (typeof right !== "boolean") {
      throw new Error(`Operator "&&" requires boolean arguments. Second argument is ${right}.`);
    }

    return left && right;
  }
  _evaluatePlus(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left + right;
    }

    throw new Error(
      `Operator "+" requires vector or number arguments of matching types, or at least one string argument. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateMinus(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left - right;
    }

    throw new Error(
      `Operator "-" requires vector or number arguments of matching types. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateTimes(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left * right;
    }

    throw new Error(
      `Operator "*" requires vector or number arguments. If both arguments are vectors they must be matching types. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateDivide(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left / right;
    }

    throw new Error(
      `Operator "/" requires vector or number arguments of matching types, or a number as the second argument. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateMod(feature: Feature) {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    if (typeof left === "number" && typeof right === "number") {
      return left % right;
    }

    throw new Error(
      `Operator "%" requires vector or number arguments of matching types. Arguments are ${left} and ${right}.`,
    );
  }
  _evaluateEqualsStrict(feature: Feature): boolean {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    return left === right;
  }
  _evaluateNotEqualsStrict(feature: Feature): boolean {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);

    return left !== right;
  }
  _evaluateConditional(feature: Feature) {
    const test = this._test.evaluate(feature);

    if (typeof test !== "boolean") {
      throw new Error(
        `Conditional argument of conditional expression must be a boolean. Argument is ${test}.`,
      );
    }

    if (test) {
      return this._left.evaluate(feature);
    }
    return this._right.evaluate(feature);
  }
  _evaluateNaN(feature: Feature): boolean {
    return isNaN(this._left.evaluate(feature));
  }
  _evaluateIsFinite(feature: Feature): boolean {
    return isFinite(this._left.evaluate(feature));
  }

  _evaluateBooleanConversion(feature: Feature): boolean {
    return Boolean(this._left.evaluate(feature));
  }
  _evaluateNumberConversion(feature: Feature): number {
    return Number(this._left.evaluate(feature));
  }
  _evaluateStringConversion(feature: Feature): string {
    return String(this._left.evaluate(feature));
  }
  _evaluateToString(feature: Feature): string | Error {
    const left = this._left.evaluate(feature);
    if (left instanceof RegExp) {
      return String(left);
    }
    throw new Error(`Unexpected function call "${this._value}".`);
  }
}

function getEvaluateUnaryFunction(call: string): (feature: any) => number {
  const evaluate = unaryFunctions[call];
  return function (this: { _left: any }, feature: any): number {
    const left = this._left.evaluate(feature);
    return evaluate(call, left);
  };
}

function getEvaluateBinaryFunction(call: string): (feature: any) => number {
  const evaluate = binaryFunctions[call];
  return function (this: { _left: any; _right: any }, feature: any): number {
    const left = this._left.evaluate(feature);
    const right = this._right.evaluate(feature);
    return evaluate(call, left, right);
  };
}

function isVariable(name: string): boolean {
  return name.substring(0, 4) === "czm_";
}

function getPropertyName(variable: string): string {
  return variable.substring(4);
}
