export type StyleExpression = ConditionsExpression | string | boolean | number;

export type ConditionsExpression = {
  conditions: [string, string][];
};
