import { differenceBy } from "lodash";

export function arrayIndexDiff<T>(oldList: T[], newList: T[]): [T, number, number][] {
  const newIds = newList.map<[T, number]>((e, i) => [e, i]);
  const oldIds = oldList.map<[T, number]>((e, i) => [e, i]);

  const added = differenceBy(newIds, oldIds, ([element]) => element);
  const left = differenceBy(newIds, added, ([element]) => element);
  const removed = differenceBy(oldIds, newIds, ([element]) => element);

  // [element, oldIndex]
  const newAndRemoved = mergeArrays(
    newIds.map<[T, number]>(([element]) => [
      element,
      oldList.findIndex(element2 => element === element2),
    ]),
    removed.map<[[T, number], number]>(([element, oldIndex]) => [[element, oldIndex], oldIndex]),
  );

  return added
    .map<[T, number, number]>(([element]) => [
      element,
      -1,
      newAndRemoved.findIndex(([element2]) => element === element2),
    ])
    .concat(
      left
        .map<[T, number, number]>(([element]) => [
          element,
          oldList.findIndex(f => f === element),
          newAndRemoved.findIndex(([element2]) => element === element2),
        ])
        .filter(
          ([, oldIndex, newIndex]) =>
            oldIndex +
              // Consider the number of newrly added element, or elements that were located behind me
              newAndRemoved
                .slice(0, newIndex)
                .filter(([, oldIndex2]) => oldIndex2 === -1 || oldIndex < oldIndex2).length !==
            newIndex,
        ),
    )
    .sort(([, , newIndex], [, , newIndex2]) => newIndex - newIndex2)
    .concat(removed.map<[T, number, number]>(([element, oldIndex]) => [element, oldIndex, -1]));
}

function mergeArrays<T>(array1: T[], array2: [T, number][]): T[] {
  const result = [...array1];
  array2.forEach(([element, index]) => {
    result.splice(index, 0, element);
  });
  return result;
}

export function arrayObjectDiff<T>(
  original: T[],
  update: T[],
  key: keyof T | ((t: T) => T[keyof T]),
  compareUpdated: (a: T, b: T) => boolean,
): {
  added: T[];
  deleted: T[];
  updated: T[];
} {
  const k = (e: T): T[keyof T] => (typeof key === "function" ? key(e) : e[key]);
  const added = differenceBy(original, update, k);
  const deleted = differenceBy(update, original, k);
  const remaining = original
    .filter(e => !deleted.includes(e))
    .map((e): [T[keyof T], T] => [k(e), e]);
  const updatedWithKeys = update
    .filter(e => !deleted.includes(e))
    .map((e): [T[keyof T], T] => [k(e), e]);
  const updated = remaining
    .map(([k, e]): [T[keyof T], T, T | undefined] => [
      k,
      e,
      updatedWithKeys.find(([m]) => m === k)?.[1],
    ])
    .filter((i): i is [T[keyof T], T, T] => {
      const [, e, ne] = i;
      return !!ne && compareUpdated(e, ne);
    })
    .map(([, , ne]) => ne);

  return {
    added,
    deleted,
    updated,
  };
}
