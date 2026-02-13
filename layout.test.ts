import { test, expect } from "bun:test";
import { layout } from "./layout";
import type { IADiagram } from "./model";

test("lays out a single node", () => {
  const diagram: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
    ],
  };

  const result = layout(diagram);
  expect(result.siteName).toBe("Test");
  expect(result.nodes).toHaveLength(1);
  expect(result.nodes[0].x).toBe(0);
  expect(result.nodes[0].y).toBe(0);
  expect(result.nodes[0].width).toBeGreaterThan(0);
  expect(result.nodes[0].height).toBeGreaterThan(0);
  expect(result.width).toBe(result.nodes[0].width);
  expect(result.height).toBe(result.nodes[0].height);
});

test("positions siblings horizontally", () => {
  const diagram: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
      {
        name: "about",
        path: "/about",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
    ],
  };

  const result = layout(diagram);
  expect(result.nodes).toHaveLength(2);
  expect(result.nodes[0].x).toBe(0);
  expect(result.nodes[1].x).toBeGreaterThan(result.nodes[0].x + result.nodes[0].width);
});

test("positions children below parents", () => {
  const diagram: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "products",
        path: "/products",
        isPageStack: false,
        children: [
          {
            name: "detail",
            path: "/products/:id",
            isPageStack: true,
            children: [],
            links: [],
            components: [],
          },
        ],
        links: [],
        components: [],
      },
    ],
  };

  const result = layout(diagram);
  const parent = result.nodes[0];
  const child = parent.children[0];
  expect(child.y).toBeGreaterThan(parent.y);
});

test("parent section has bounding box around children", () => {
  const diagram: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "about",
        path: "/about",
        isPageStack: false,
        children: [
          {
            name: "team",
            isPageStack: false,
            children: [],
            links: [],
            components: [],
          },
          {
            name: "contact",
            path: "/contact",
            isPageStack: false,
            children: [],
            links: [],
            components: [],
          },
        ],
        links: [],
        components: [],
      },
    ],
  };

  const result = layout(diagram);
  const parent = result.nodes[0];
  expect(parent.children).toHaveLength(2);
  for (const child of parent.children) {
    expect(child.x).toBeGreaterThanOrEqual(parent.x);
    expect(child.y).toBeGreaterThanOrEqual(parent.y);
    expect(child.x + child.width).toBeLessThanOrEqual(parent.x + parent.width);
    expect(child.y + child.height).toBeLessThanOrEqual(parent.y + parent.height);
  }
});

test("generates edges for navigation links", () => {
  const diagram: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [{ target: "about" }],
        components: [],
      },
      {
        name: "about",
        path: "/about",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
    ],
  };

  const result = layout(diagram);
  expect(result.edges).toHaveLength(1);
  expect(result.edges[0].fromNode).toBe("home");
  expect(result.edges[0].toNode).toBe("about");
  expect(result.edges[0].x1).toBe(result.nodes[0].x + result.nodes[0].width / 2);
  expect(result.edges[0].y1).toBe(result.nodes[0].y + result.nodes[0].height);
  expect(result.edges[0].x2).toBe(result.nodes[1].x + result.nodes[1].width / 2);
  expect(result.edges[0].y2).toBe(result.nodes[1].y);
});

test("handles empty diagram", () => {
  const diagram: IADiagram = {
    siteName: "Empty",
    nodes: [],
  };

  const result = layout(diagram);
  expect(result.nodes).toHaveLength(0);
  expect(result.edges).toHaveLength(0);
  expect(result.width).toBe(0);
  expect(result.height).toBe(0);
});

test("accounts for components in node height", () => {
  const withComponents: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: ["hero", "featured"],
      },
    ],
  };
  const withoutComponents: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
    ],
  };

  const withResult = layout(withComponents);
  const withoutResult = layout(withoutComponents);
  expect(withResult.nodes[0].height).toBeGreaterThan(withoutResult.nodes[0].height);
});

test("overall layout dimensions encompass all nodes", () => {
  const diagram: IADiagram = {
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
      {
        name: "products",
        path: "/products",
        isPageStack: false,
        children: [
          {
            name: "detail",
            path: "/products/:id",
            isPageStack: true,
            children: [],
            links: [],
            components: [],
          },
        ],
        links: [],
        components: [],
      },
    ],
  };

  const result = layout(diagram);
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
});
