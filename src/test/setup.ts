/* eslint-disable @typescript-eslint/no-namespace */
import { type EmotionMatchers, matchers as emotionMatchers } from "@emotion/jest";
import domMatchers, { type TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { mockFetch } from "vi-fetch";
import { beforeEach, expect } from "vitest";
import "vi-fetch/setup";

// Vitest on GitHub Actions requires TransformStream to run tests with Cesium
import "web-streams-polyfill/es2018";

declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void>,
        EmotionMatchers {}
  }
}

expect.extend(domMatchers);
expect.extend(emotionMatchers as any);

beforeEach(() => {
  cleanup();
  mockFetch.clearAll();
});
