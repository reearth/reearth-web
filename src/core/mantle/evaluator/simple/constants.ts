export const enum ExpressionNodeType {
  VARIABLE,
  UNARY,
  BINARY,
  TERNARY,
  CONDITIONAL,
  MEMBER,
  FUNCTION_CALL,
  ARRAY,
  REGEX,
  VARIABLE_IN_STRING,
  LITERAL_NULL,
  LITERAL_BOOLEAN,
  LITERAL_NUMBER,
  LITERAL_STRING,
  LITERAL_COLOR,
  LITERAL_VECTOR,
  LITERAL_REGEX,
  LITERAL_UNDEFINED,
  BUILTIN_VARIABLE,
}

export const unaryOperators = ["!", "-", "+"];
export const binaryOperators = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "===",
  "!==",
  ">",
  ">=",
  "<",
  "<=",
  "&&",
  "||",
  "!~",
  "=~",
];

export const variableRegex = /\${(.*?)}/g; // Matches ${variable_name}
export const backslashRegex = /\\/g;
export const backslashReplacement = "@#%";
export const replacementRegex = /@#%/g;
