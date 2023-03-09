import { JSONPath } from "jsonpath-plus";

import { Feature } from "../../../types";
import { defined } from "../../../utils";

import { JPLiteral } from "./expression";
import { generateRandomString } from "./utils";

export function replaceVariables(expression: string, feature?: any): [string, JPLiteral[]] {
  let exp = expression;
  let result = "";
  const literalJP: JPLiteral[] = [];
  let i = exp.indexOf("${");
  while (i >= 0) {
    if (isInsideQuotes(exp, i)) {
      const closeQuote = findCloseQuote(exp, i);
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
        if (containsValidJSONPath(varExp, feature)) {
          const res = JSONPath({ json: feature, path: varExp });
          if (res.length == 1) {
            const placeholderLiteral = generateRandomString(10);
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
        const replacedVarExp = replaceReservedWord(varExp);
        result += `czm_${replacedVarExp}`;
      }
      exp = exp.substring(j + 1);
      i = exp.indexOf("${");
    }
  }
  result += exp;
  return [result, literalJP];
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

function findCloseQuote(exp: string, index: number): number {
  const openSingleQuote = exp.indexOf("'");
  const openDoubleQuote = exp.indexOf('"');

  if (openSingleQuote >= 0 && openSingleQuote < index) {
    return exp.indexOf("'", openSingleQuote + 1);
  } else if (openDoubleQuote >= 0 && openDoubleQuote < index) {
    return exp.indexOf('"', openDoubleQuote + 1);
  }

  return -1;
}

function getCloseBracketIndex(exp: string, openBracketIndex: number): number {
  const j = exp.indexOf("}", openBracketIndex);
  if (j < 0) {
    throw new Error(`replaceVariable: Unmatched {.`);
  }
  return j;
}

function containsValidJSONPath(expression: string, feature: Feature): boolean {
  try {
    JSONPath({ json: feature, path: expression });
    return true;
  } catch (error) {
    return false;
  }
}

const makeReservedWord = (str: string) => `$reearth_${str}_$`;
const RESERVED_WORDS: Record<string, string> = {
  "[": makeReservedWord("opened_square_bracket"),
  "]": makeReservedWord("closed_square_bracket"),
  "{": makeReservedWord("opened_curly_bracket"),
  "}": makeReservedWord("closed_curly_bracket"),
  "(": makeReservedWord("opened_parentheses"),
  ")": makeReservedWord("closed_parentheses"),
  "-": makeReservedWord("hyphen"),
};

const replaceReservedWord = (word: string) => {
  const wordFiltered = word.replace(/-/g, RESERVED_WORDS["-"]);
  return wordFiltered.replaceAll(
    /(.*)(\[|\{|\()(.*)(\]|\}|\))(?!\.|\[)(.+)/g,
    (_match, prefix, openedBracket, inner, closedBracket, suffix) => {
      return `${prefix}${RESERVED_WORDS[openedBracket]}${inner}${RESERVED_WORDS[closedBracket]}${suffix}`;
    },
  );
};

export const restoreReservedWord = (text: string) =>
  Object.entries(RESERVED_WORDS).reduce((res, [key, val]) => res.replace(val, key), text);
