import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { expect, test, vi } from "vitest";

import useHooks, { type Layer, type Ref } from "./hooks";

test("hooks", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
        },
      ],
    },
    { id: "w", type: "simple", title: "W" },
  ];

  const {
    result: { current },
  } = renderHook(() => useHooks({ layers }));

  expect(current.flattenedLayers).toEqual([
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
  ]);
  expect(current.atomsMap.get("y")).not.toBeUndefined();
  expect(current.atomsMap.get("v")).toBeUndefined();
});

test("isLayer", () => {
  const layers: Layer[] = [{ id: "x", type: "simple" }];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.isLayer(1)).toBe(false);
  expect(ref?.isLayer({})).toBe(false);
  const layer = ref?.findById("x");
  if (!layer) throw new Error("layer is not found");
  expect(ref?.isLayer(layer)).toBe(true);
});

test("findById", () => {
  const layers: Layer[] = [{ id: "x", type: "simple", title: "X" }];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findById("y")).toBeUndefined();
  const layer = ref?.findById("x");
  expect(layer?.id).toBe("x");
  expect(layer?.title).toBe("X");
});

test("findByIds", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findByIds("a", "b")).toEqual([undefined, undefined]);

  const found = ref?.findByIds("x", "y");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("walk", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "z", type: "group", children: [{ id: "y", type: "simple", title: "Y" }] },
    { id: "w", type: "simple", title: "W" },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  const cb1 = vi.fn(() => "a");
  expect(ref?.walk(cb1)).toBe("a");
  expect(cb1.mock.calls).toEqual([[{ id: "x" }, 0, [{ id: "x" }, { id: "z" }, { id: "w" }]]]);

  const cb2 = vi.fn();
  expect(ref?.walk(cb2)).toBeUndefined();
  expect(cb2.mock.calls).toEqual([
    [{ id: "x" }, 0, [{ id: "x" }, { id: "z" }, { id: "w" }]],
    [{ id: "z" }, 1, [{ id: "x" }, { id: "z" }, { id: "w" }]],
    [{ id: "y" }, 0, [{ id: "y" }]],
    [{ id: "w" }, 2, [{ id: "x" }, { id: "z" }, { id: "w" }]],
  ]);
});

test("find", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "z", type: "group", children: [{ id: "y", type: "simple", title: "Y" }] },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.find(l => l.title === "A")).toBeUndefined();

  const found = ref?.find(l => l.title === "X" || l.title === "Y");
  expect(found?.id).toBe("x");
  expect(found?.title).toBe("X");
});

test("findAll", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "z", type: "group", children: [{ id: "y", type: "simple", title: "Y" }] },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findAll(l => l.title === "A")).toEqual([]);

  const found = ref?.findAll(l => l.title === "X" || l.title === "Y");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("findByTags", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X", tags: [{ id: "tag", label: "Tag" }] },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          tags: [
            { id: "tag2", label: "Tag2" },
            { id: "tag", label: "Tag" },
          ],
        },
      ],
    },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findByTags("Tag")).toEqual([]);

  const found = ref?.findByTags("tag", "tag2");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("findByTagLabels", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X", tags: [{ id: "tag", label: "Tag" }] },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          tags: [
            { id: "tag2", label: "Tag2" },
            { id: "tag", label: "Tag" },
          ],
        },
      ],
    },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findByTagLabels("tag")).toEqual([]);

  const found = ref?.findByTagLabels("Tag", "Tag2");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("add, replace, delete", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
        },
      ],
    },
    { id: "w", type: "simple", title: "W" },
  ];

  const { result, rerender } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const { flattenedLayers } = useHooks({ layers, ref });
    return { ref, flattenedLayers };
  });

  const idLength = 36;
  const addedLayers = result.current.ref.current?.addAll({
    type: "group",
    title: "C",
    children: [
      {
        type: "group",
        title: "B",
        children: [
          {
            type: "simple",
            title: "A",
            infobox: {
              blocks: [{ extensionId: "a" }],
            },
          },
        ],
      },
    ],
  });
  const l = addedLayers?.[0];
  expect(l?.id).toBeTypeOf("string");
  expect(l?.id).toHaveLength(idLength);
  expect(l?.type).toBe("group");
  expect(l?.title).toBe("C");
  if (l?.type !== "group") throw new Error("invalid layer type");
  expect(l.children[0].id).toBeTypeOf("string");
  expect(l.children[0].id).toHaveLength(idLength);
  expect(l.children[0].type).toBe("group");
  expect(l.children[0].title).toBe("B");
  if (l.children[0].type !== "group") throw new Error("invalid layer type");
  expect(l.children[0].children[0].id).toBeTypeOf("string");
  expect(l.children[0].children[0].id).toHaveLength(idLength);
  expect(l.children[0].children[0].type).toBe("simple");
  expect(l.children[0].children[0].title).toBe("A");
  expect(l.children[0].children[0].infobox?.blocks?.[0].id).toBeTypeOf("string");
  expect(l.children[0].children[0].infobox?.blocks?.[0].id).toHaveLength(idLength);

  rerender();

  expect(result.current.flattenedLayers).toEqual([
    {
      id: l.children[0].children[0].id,
      type: "simple",
      title: "A",
      infobox: {
        blocks: [{ id: l.children[0].children[0].infobox?.blocks?.[0].id, extensionId: "a" }],
      },
    },
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
  ]);

  result.current.ref.current?.replace({
    id: l.children[0].children[0].id,
    type: "simple",
    title: "A!",
  });

  rerender();

  expect(result.current.flattenedLayers).toEqual([
    {
      id: l.children[0].children[0].id,
      type: "simple",
      title: "A!",
    },
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
  ]);

  result.current.ref.current?.deleteLayer(l.children[0].id, "w");

  rerender();

  expect(result.current.flattenedLayers).toEqual([
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
  ]);
});

test("override", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          marker: { pointSize: 10, pointColor: "red" },
        },
      ],
    },
  ];

  const { result, rerender } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const { flattenedLayers } = useHooks({ layers, ref });
    return { ref, flattenedLayers };
  });

  result.current.ref.current?.override("y", {
    id: "z", // should be ignored
    ...({
      type: "group", // should be ignored
    } as any),
    title: "Y!",
    marker: { pointSize: 100 },
    tags: [{ id: "t", label: "t" }],
  });
  rerender();
  const l = result.current.flattenedLayers[1];
  if (l.type !== "simple") throw new Error("invalid layer type");
  expect(l.title).toBe("Y!");
  expect(l.marker).toEqual({ pointSize: 100, pointColor: "red" });
  expect(l.tags).toEqual([{ id: "t", label: "t" }]);
  expect(result.current.ref.current?.findById("y")?.title).toBe("Y");

  result.current.ref.current?.override("y", {
    title: "Y!!",
    marker: { pointColor: "blue" },
    tags: [{ id: "t2", label: "t2" }],
  });
  rerender();
  const l2 = result.current.flattenedLayers[1];
  if (l2.type !== "simple") throw new Error("invalid layer type");
  expect(l2.title).toBe("Y!!");
  expect(l2.marker).toEqual({ pointSize: 10, pointColor: "blue" });
  expect(l2.tags).toEqual([{ id: "t2", label: "t2" }]);

  result.current.ref.current?.override("y");
  rerender();
  const l3 = result.current.flattenedLayers[1];
  if (l3.type !== "simple") throw new Error("invalid layer type");
  expect(l3.title).toBe("Y");
  expect(l3.marker).toEqual({ pointSize: 10, pointColor: "red" });
  expect(l3.tags).toBeUndefined();
});
