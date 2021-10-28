import { convertPasswordPolicy } from "./config";

test("convert password policy to regular expression", () => {
  const passwordPolicy = {
    whiteSpace: "(?=.*\\s)",
    highSecurity: "^(?=.*[a-z])(?=.*[A-Z])((?=(.*\\d){2}))",
    wrong: "@[",
  };
  const actual = convertPasswordPolicy(passwordPolicy);
  expect(actual).toStrictEqual({
    whiteSpace: /(?=.*\s)/,
    highSecurity: /^(?=.*[a-z])(?=.*[A-Z])((?=(.*\d){2}))/,
    wrong: undefined,
  });
});

test("return undefined if no password policy", () => {
  const actual = convertPasswordPolicy(undefined);
  expect(actual).toBeUndefined();
});
