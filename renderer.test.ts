import { test, expect } from "bun:test";
import { render } from "./renderer";
import { layout } from "./layout";
import type { IADiagram } from "./model";
import { darkTheme, defaultTheme } from "./theme";
import { parse } from "./parser";
import { complexDiagramEdgeCount, complexDiagramSource } from "./test-fixtures";

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
        notes: [],
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
        notes: [],
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
        notes: [],
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
        notes: [],
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
        notes: [],
      },
      {
        name: "about",
        path: "/about",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
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
            notes: [],
          },
        ],
        links: [],
        components: [],
        notes: [],
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
        notes: [],
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
        notes: [],
      },
      {
        name: "about",
        path: "/about",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
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
        notes: [],
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
        notes: [],
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
        notes: [],
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
        notes: [],
      },
      {
        name: "about",
        path: "/about",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
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
        notes: [],
      },
    ],
  });
  const svg = render(positioned, darkTheme);

  expect(svg).toContain(`fill="${darkTheme.stackBackFill}"`);
  expect(svg).toContain(`fill="${darkTheme.stackMidFill}"`);
});

test("renders external links as dashed arrows with URL label", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [{ target: "https://stripe.com/api", url: "https://stripe.com/api" }],
        components: [],
        notes: [],
      },
    ],
  });

  expect(svg).toContain('stroke-dasharray="6 3"');
  expect(svg).toContain("https://stripe.com/api");
});

test("renders notes as callouts with left border", () => {
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
        notes: ["Primary entry point"],
      },
    ],
  });

  expect(svg).toContain("Primary entry point");
  expect(svg).toContain("font-style=\"italic\"");
  expect(svg).toContain("<line");
  expect(svg).toContain(`fill="${defaultTheme.noteText}"`);
});

test("notes are visually distinct from other node text", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "home",
        path: "/",
        annotation: "landing",
        isPageStack: false,
        children: [],
        links: [],
        components: ["hero"],
        notes: ["A note"],
      },
    ],
  });

  // Notes use noteText color, distinct from annotation, component, and name colors
  expect(svg).toContain(`fill="${defaultTheme.noteText}"`);
  expect(svg).toContain(`fill="${defaultTheme.annotationText}"`);
  expect(svg).toContain(`fill="${defaultTheme.componentText}"`);
  expect(svg).toContain(`fill="${defaultTheme.nameText}"`);
});

test("renders site labels for multi-site diagrams", () => {
  const diagram: IADiagram = {
    siteName: "Current",
    nodes: [],
    sites: [
      {
        siteName: "Current",
        nodes: [
          {
            name: "home",
            path: "/",
            isPageStack: false,
            children: [],
            links: [],
            components: [],
            notes: [],
          },
        ],
      },
      {
        siteName: "Proposed",
        nodes: [
          {
            name: "dashboard",
            path: "/dashboard",
            isPageStack: false,
            children: [],
            links: [],
            components: [],
            notes: [],
          },
        ],
      },
    ],
  };

  const positioned = layout(diagram);
  const svg = render(positioned);

  expect(svg).toContain("Current");
  expect(svg).toContain("Proposed");
  // Site labels should be rendered as bold text
  expect(svg).toContain('font-weight="bold"');
  // Both site node contents should appear
  expect(svg).toContain("home");
  expect(svg).toContain("dashboard");
});

test("does not render site label for single-site diagrams", () => {
  const svg = renderDiagram({
    siteName: "OnlySite",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
      },
    ],
  });

  // The site name should NOT appear as a label in single-site mode
  // (only node names should be in the SVG)
  const siteNameMatches = svg.match(/OnlySite/g);
  expect(siteNameMatches).toBeNull();
});

test("renders cross-site edges", () => {
  const diagram: IADiagram = {
    siteName: "SiteA",
    nodes: [],
    sites: [
      {
        siteName: "SiteA",
        nodes: [
          {
            name: "home",
            path: "/",
            isPageStack: false,
            children: [],
            links: [{ target: "products" }],
            components: [],
            notes: [],
          },
        ],
      },
      {
        siteName: "SiteB",
        nodes: [
          {
            name: "products",
            path: "/products",
            isPageStack: false,
            children: [],
            links: [],
            components: [],
            notes: [],
          },
        ],
      },
    ],
  };

  const positioned = layout(diagram);
  const svg = render(positioned);

  // Should have an edge (path with arrowhead)
  expect(svg).toContain("<path");
  expect(svg).toContain('marker-end="url(#arrowhead)"');
});

test("renders draft status with distinct fill and reduced opacity", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "planned",
        path: "/planned",
        status: "draft",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
      },
    ],
  });

  expect(svg).toContain(`fill="${defaultTheme.statusStyles.draft.nodeFill}"`);
  expect(svg).toContain(`opacity="${defaultTheme.statusStyles.draft.nodeOpacity}"`);
});

test("renders live status with distinct fill and full opacity", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "active",
        path: "/active",
        status: "live",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
      },
    ],
  });

  expect(svg).toContain(`fill="${defaultTheme.statusStyles.live.nodeFill}"`);
  // Full opacity should not wrap in a group
  expect(svg).not.toContain('opacity=');
});

test("renders archived status with distinct fill and reduced opacity", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "old",
        path: "/old",
        status: "archived",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
      },
    ],
  });

  expect(svg).toContain(`fill="${defaultTheme.statusStyles.archived.nodeFill}"`);
  expect(svg).toContain(`opacity="${defaultTheme.statusStyles.archived.nodeOpacity}"`);
});

test("nodes without status use default fill", () => {
  const svg = renderDiagram({
    siteName: "Test",
    nodes: [
      {
        name: "normal",
        path: "/",
        isPageStack: false,
        children: [],
        links: [],
        components: [],
        notes: [],
      },
    ],
  });

  expect(svg).toContain(`fill="${defaultTheme.nodeFill}"`);
  expect(svg).not.toContain('opacity=');
});

test("renders the shared complex fixture with dense escaped SVG output", () => {
  const svg = render(layout(parse(complexDiagramSource)));

  expect((svg.match(/marker-end="url\(#arrowhead\)"/g) || []).length).toBe(complexDiagramEdgeCount);
  expect(svg).toContain("Landing &amp; &lt;Overview&gt; &quot;Alpha&quot;");
  expect(svg).toContain('[hero &amp; promo &lt;grid&gt; &quot;A&quot;]');
  expect(svg).toContain("Primary path for cafe users and admins in café &lt;beta&gt;");
  expect(svg).toContain("https://docs.example.com/api?ref=ia&amp;mode=svg");
  expect(svg).not.toContain('Landing & <Overview> "Alpha"');
});
