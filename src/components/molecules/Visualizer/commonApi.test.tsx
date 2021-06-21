import useCommonAPI from "./commonApi";
import { renderHook } from "@testing-library/react-hooks";

test("works", () => {
  const engine = {
    requestRender: jest.fn(),
    getLocationFromScreenXY: jest.fn((_x: number, _y: number) => ({ lat: 0, lng: 1, height: 2 })),
    flyTo: jest.fn(),
  };
  const primitives = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const camera = { lat: 0, lng: 0, height: 0, pitch: 0, heading: 0, roll: 0, fov: 0 };
  const onLayerSelect = jest.fn();

  const { result } = renderHook(() =>
    useCommonAPI({
      engineRef: { current: engine },
      primitives,
      camera,
      onLayerSelect,
    }),
  );

  expect(result.current.primitives).toBe(primitives);
  expect(result.current.camera).toBe(camera);

  // getLayer
  expect(result.current.getLayer("d")).toBeUndefined();
  expect(result.current.getLayer("a")).toBe(primitives[0]);

  // getLayers
  expect(result.current.getLayers([])).toEqual([]);
  expect(result.current.getLayers(["d", "a"])).toEqual([undefined, primitives[0]]);

  // selectLayer
  expect(onLayerSelect).toBeCalledTimes(0);
  result.current.selectLayer("a");
  expect(onLayerSelect).toBeCalledTimes(1);
  expect(onLayerSelect).toBeCalledWith("a");
  result.current.selectLayer("b", "reason");
  expect(onLayerSelect).toBeCalledTimes(2);
  expect(onLayerSelect).toBeCalledWith("b", "reason");

  // flyTo
  expect(engine.flyTo).toBeCalledTimes(0);
  const easing = (t: number) => t;
  result.current.flyTo(
    { lat: 0, lng: 1, height: 2, pitch: 3, heading: 4, roll: 5 },
    { duration: 101, easing },
  );
  expect(engine.flyTo).toBeCalledTimes(1);
  expect(engine.flyTo).toBeCalledWith(
    { lat: 0, lng: 1, height: 2, pitch: 3, heading: 4, roll: 5 },
    { duration: 101, easing },
  );

  // requestRender
  expect(engine.requestRender).toBeCalledTimes(0);
  result.current.requestRender();
  expect(engine.requestRender).toBeCalledTimes(1);

  // getLocationFromScreenXY
  expect(engine.getLocationFromScreenXY).toBeCalledTimes(0);
  expect(result.current.getLocationFromScreenXY(123, 321)).toEqual({ lat: 0, lng: 1, height: 2 });
  expect(engine.getLocationFromScreenXY).toBeCalledTimes(1);
  expect(engine.getLocationFromScreenXY).toBeCalledWith(123, 321);
});
