import fs from "node:fs/promises";

import yaml from "js-yaml";

const findKeyFromValueRecursiveObj = (obj, val) => {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const objValue = obj[key];
    if (typeof objValue === "string") {
      if (objValue === val) return key;
      continue;
    }
    const foundKey = findKeyFromValue(objValue, val);
    if (foundKey) {
      return foundKey;
    }
  }
};

const findValueFromKeyRecursiveObj = (obj, key) => {
  const keys = Object.keys(obj);
  for (const objKey of keys) {
    const objValue = obj[objKey];
    if (typeof objValue === "string") {
      if (objKey === key) return objValue;
      continue;
    }
    const foundValue = findValueFromKey(objValue, key);
    if (foundValue) {
      return foundValue;
    }
  }
};

const findKeyFromValue = (obj, val) => {
  if (Array.isArray(obj)) {
    throw Error("Array is not supported");
  } else {
    return findKeyFromValueRecursiveObj(obj, val);
  }
};

const findValueFromKey = (obj, key) => {
  if (Array.isArray(obj)) {
    throw Error("Array is not supported");
  } else {
    return findValueFromKeyRecursiveObj(obj, key);
  }
};

// You need to run this script after `yarn i18n`.
const run = async () => {
  const [legacyEnRaw, legacyJaRaw, newJaRaw] = await Promise.all([
    fs.readFile("./src/i18n/translations/legacy/en.yml", "utf8"),
    fs.readFile("./src/i18n/translations/legacy/ja.yml", "utf8"),
    fs.readFile("./src/i18n/translations/ja.yml", "utf8"),
  ]);
  const legacyEn = yaml.load(legacyEnRaw);
  const legacyJa = yaml.load(legacyJaRaw);
  const newJa = yaml.load(newJaRaw);

  const result = {};
  const keys = Object.keys(newJa);
  for (const key of keys) {
    // If value is only exist in new ja file then use existing value.
    if (newJa[key]) {
      result[key] = newJa[key];
      continue;
    }

    const replacedKey = key.replace(/\{\{(.+)\}\}/, "{$1}");
    const hash = findKeyFromValue(legacyEn, replacedKey);
    if (hash) {
      const value = findValueFromKey(legacyJa, hash);
      result[key] = value;
    } else {
      throw new Error("Hash is not found");
    }
  }

  const rawYaml = yaml.dump(result);
  await fs.writeFile("./src/i18n/translations/ja.yml", rawYaml, "utf8");
};

run();
