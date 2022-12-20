export type StyleExpression = ConditionsExpression | string | boolean | number;

export type ConditionsExpression = {
  conditions: [string, string][];
};

export type UnaryFunction = (call: string, left: number) => number;
export type BinaryFunction = (call: string, left: number, right: number) => number;

export type JPLiteral = {
  literal_name: string;
  literal_value: any;
};
