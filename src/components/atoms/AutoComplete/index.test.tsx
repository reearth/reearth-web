import React from "react";

import { act, fireEvent, render, screen, waitFor } from "@reearth/test/utils";

import AutoComplete from "./index";

const sampleItems: { value: string; label: string }[] = [
  {
    value: "hoge",
    label: "hoge",
  },
  {
    value: "fuga",
    label: "fuga",
  },
];

test("component should be renered", async () => {
  await act(async () => {
    render(<AutoComplete />);
  });
});

test("component should render items", async () => {
  await act(async () => {
    render(<AutoComplete items={sampleItems} />);
  });
  expect(screen.getByText(/hoge/)).toBeInTheDocument();
  expect(screen.getByText(/fuga/)).toBeInTheDocument();
});

test("component should be inputtable", async () => {
  await act(async () => {
    render(<AutoComplete items={sampleItems} />);
  });

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "hoge" } });
  expect(screen.getByText("hoge")).toBeInTheDocument();
});

describe("Ccomponent should be searchable", () => {
  //コンポーネントは入力された文字に一致する選択肢を残す
  test("component should leave selects hit", async () => {
    await act(async () => {
      render(<AutoComplete items={sampleItems} />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "hoge" } });
      expect(screen.getByText("hoge")).toBeInTheDocument();
    });
  });

  //コンポーネントは入力された選択肢以外は残さない
  test("component shouldn't leave selects which don't hit inputted text", async () => {
    await act(async () => {
      render(<AutoComplete items={sampleItems} />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "hoge" } });
      await waitFor(() => {
        expect(screen.queryByText("fuga")).not.toBeInTheDocument();
      });
    });
  });

  test("component should trigger onSelect function with click event", async () => {
    await act(async () => {
      const handleSelect = jest.fn((value: string) => {
        console.log(value);
      });
      render(<AutoComplete items={sampleItems} onSelect={handleSelect} />);
      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "hoge" } });
        const option = screen.getByText(/hoge/);
        fireEvent.click(option);
      });
      await waitFor(() => {
        expect(handleSelect).toBeCalled();
        expect(handleSelect.mock.calls[0][0]).toBe("hoge");
      });
    });
  });
  // test("component should trigger onSelect function with 'enter' key press event", async () => {
  //   await act(async () => {
  //     const handleSelect = jest.fn((value: string) => {
  //       console.log(value);
  //     });
  //     render(<AutoComplete items={sampleItems} onSelect={handleSelect} />);
  //     const input = screen.getByRole("textbox");
  //     await act(async () => {
  //       fireEvent.change(input, { target: { value: "hoge" } });
  //       screen.debug();
  //       fireEvent.keyDown(input, { key: "Enter" });
  //     });
  //     await waitFor(() => {
  //       expect(handleSelect).toBeCalled();
  //       expect(handleSelect.mock.calls[0][0]).toBe("hoge");
  //     });
  //   });
  // });
});
