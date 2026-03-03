import { expect, test } from "bun:test";
import {
  createPlaygroundRenderState,
  formatPlaygroundError,
  getExampleSource,
  getTheme,
  listExampleNames,
} from "./playground-state";
import { darkTheme, defaultTheme } from "./theme";

test("lists the available examples and loads an example source", () => {
  expect(listExampleNames()).toEqual([
    "E-commerce",
    "Docs Site",
    "SaaS Dashboard",
  ]);
  expect(getExampleSource("Docs Site")).toContain("site Docs");
  expect(getExampleSource("Docs Site")).toContain("api-reference /api");
});

test("falls back to the default theme when an unknown theme is selected", () => {
  expect(getTheme("default")).toBe(defaultTheme);
  expect(getTheme("dark")).toBe(darkTheme);
  expect(getTheme("missing-theme")).toBe(defaultTheme);
});

test("creates a successful render state for valid input", () => {
  const state = createPlaygroundRenderState(
    `site MyApp
  home /
`,
    "missing-theme",
  );

  expect(state.error).toBeNull();
  expect(state.svg).toContain("<svg");
});

test("formats parser failures with line and column details", () => {
  const state = createPlaygroundRenderState(
    `site Test
  home /(
`,
    "default",
  );

  expect(state).toEqual({
    error: 'Line 3, column 1: Expected ")" or [^)] but end of input found.',
  });
});

test("falls back to a plain message when an error has no location", () => {
  expect(formatPlaygroundError(new Error("Broken"))).toBe("Broken");
  expect(formatPlaygroundError("nope")).toBe("Parse error");
});
