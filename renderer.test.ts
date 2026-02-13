import { test, expect } from "bun:test";
import { render } from "./renderer";
import { layout } from "./layout";
import type { IADiagram } from "./model";
import { darkTheme, defaultTheme } from "./theme";

function renderDiagram(diagram: IADiagram): string {
  return render(layout(diagram));
}

test("produces valid SVG document", () => {
  const svg = renderDiagram({
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
  });

  expect(svg).toContain("<svg");
  expect(svg).toContain("xmlns=");
  expect(svg).toContain("</svg>");
});

test("renders pages as rounded rectangles", () => {
  const svg = renderDiagram({
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
  });

  expect(svg).toContain('<rect');
  expect(svg).toContain('rx="6"');
});

test("renders page stacks as stacked rectangles", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "detail",
        path: "/products/:id",
        isPageStack: true,
        children: [],
        links: [],
        components: [],
      },
    ],
  });

  // Page stacks should have 3 rects (2 offset + 1 front)
  const rectCount = (svg.match(/<rect /g) || []).length;
  expect(rectCount).toBe(3);
});

test("renders labels and paths on nodes", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "products",
        path: "/products",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
    ],
  });

  expect(svg).toContain("products");
  expect(svg).toContain("/products");
});

test("renders navigation arrows with arrowheads", () => {
  const svg = renderDiagram({
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
  });

  expect(svg).toContain("<marker");
  expect(svg).toContain("arrowhead");
  expect(svg).toContain("<path");
  expect(svg).toContain('marker-end="url(#arrowhead)"');
});

test("renders section bounding boxes for nodes with children", () => {
  const svg = renderDiagram({
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
        ],
        links: [],
        components: [],
      },
    ],
  });

  // Section should have dashed border
  expect(svg).toContain('stroke-dasharray');
  // Both parent label and child label should appear
  expect(svg).toContain("about");
  expect(svg).toContain("team");
});

test("renders components in nodes", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: ["hero", "featured-products"],
      },
    ],
  });

  expect(svg).toContain("[hero]");
  expect(svg).toContain("[featured-products]");
});

test("renders edges as bezier curves", () => {
  const svg = renderDiagram({
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
  });

  // Edges should use cubic bezier path, not straight lines
  expect(svg).not.toContain("<line");
  expect(svg).toMatch(/<path d="M .* C .*/);
  expect(svg).toContain('fill="none"');
});

test("escapes special XML characters", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "a&b",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
      },
    ],
  });

  expect(svg).toContain("a&amp;b");
  expect(svg).not.toContain("a&b");
});

test("uses default theme colors when no theme specified", () => {
  const svg = renderDiagram({
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
  });

  expect(svg).toContain(`fill="${defaultTheme.nodeFill}"`);
  expect(svg).toContain(`fill="${defaultTheme.nameText}"`);
});

test("renders with dark theme colors", () => {
  const positioned = layout({
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
  });
  const svg = render(positioned, darkTheme);

  expect(svg).toContain(`fill="${darkTheme.nodeFill}"`);
  expect(svg).toContain(`stroke="${darkTheme.nodeStroke}"`);
  expect(svg).toContain(`fill="${darkTheme.nameText}"`);
  expect(svg).toContain(`fill="${darkTheme.pathText}"`);
});

test("dark theme applies to edges", () => {
  const positioned = layout({
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
  });
  const svg = render(positioned, darkTheme);

  expect(svg).toContain(`stroke="${darkTheme.edgeStroke}"`);
  expect(svg).toContain(`fill="${darkTheme.edgeStroke}"`);
});

test("dark theme applies to page stacks", () => {
  const positioned = layout({
    siteName: "Test",
    nodes: [
      {
        name: "detail",
        path: "/products/:id",
        isPageStack: true,
        children: [],
        links: [],
        components: [],
      },
    ],
  });
  const svg = render(positioned, darkTheme);

  expect(svg).toContain(`fill="${darkTheme.stackBackFill}"`);
  expect(svg).toContain(`fill="${darkTheme.stackMidFill}"`);
});
