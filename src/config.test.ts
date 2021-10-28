import { convertPasswordPolicy } from "./config";

test("convert password policy to regular expression", () => {
  const passwordPolicy = {
    whiteSpace: "(?=.*\\s)",
    highSecurity: "^(?=.*[a-z])(?=.*[A-Z])((?=(.*\\d){2}))",
  };
  const actual = convertPasswordPolicy(passwordPolicy);
  expect(actual).toStrictEqual({
    whiteSpace: /(?=.*\s)/,
    highSecurity: /^(?=.*[a-z])(?=.*[A-Z])((?=(.*\d){2}))/,
  });
});

test("return undefined if no password policy", () => {
  const actual = convertPasswordPolicy(undefined);
  expect(actual).toEqual(undefined);
});
