import { test, expect } from "bun:test";
import type { IANode, IALink, IADiagram } from "./model";

test("IALink has a target", () => {
  const link: IALink = { target: "products" };
  expect(link.target).toBe("products");
});

test("IANode represents a page with all properties", () => {
  const node: IANode = {
    name: "product-detail",
    path: "/products/:id",
    annotation: "detail-page",
    isPageStack: true,
    children: [],
    links: [{ target: "home" }],
    components: ["gallery", "specs"],
  };
  expect(node.name).toBe("product-detail");
  expect(node.path).toBe("/products/:id");
  expect(node.annotation).toBe("detail-page");
  expect(node.isPageStack).toBe(true);
  expect(node.links).toHaveLength(1);
  expect(node.components).toEqual(["gallery", "specs"]);
});

test("IANode works with minimal properties", () => {
  const node: IANode = {
    name: "home",
    isPageStack: false,
    children: [],
    links: [],
    components: [],
  };
  expect(node.name).toBe("home");
  expect(node.path).toBeUndefined();
  expect(node.annotation).toBeUndefined();
});

test("IANode supports nested children", () => {
  const child: IANode = {
    name: "team",
    isPageStack: false,
    children: [],
    links: [],
    components: [],
  };
  const parent: IANode = {
    name: "about",
    path: "/about",
    isPageStack: false,
    children: [child],
    links: [],
    components: [],
  };
  expect(parent.children).toHaveLength(1);
  expect(parent.children[0].name).toBe("team");
});

test("IADiagram is the root container", () => {
  const diagram: IADiagram = {
    siteName: "MyApp",
    nodes: [
      {
        name: "home",
        path: "/",
        isPageStack: false,
        children: [],
        links: [{ target: "products" }],
        components: [],
      },
      {
        name: "products",
        path: "/products",
        isPageStack: false,
        children: [
          {
            name: "product-detail",
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
  expect(diagram.siteName).toBe("MyApp");
  expect(diagram.nodes).toHaveLength(2);
  expect(diagram.nodes[1].children[0].isPageStack).toBe(true);
});

test("dynamic routes with :param are flagged as page stacks", () => {
  const node: IANode = {
    name: "product-detail",
    path: "/products/:id",
    isPageStack: true,
    children: [],
    links: [],
    components: [],
  };
  expect(node.isPageStack).toBe(true);

  const staticNode: IANode = {
    name: "products",
    path: "/products",
    isPageStack: false,
    children: [],
    links: [],
    components: [],
  };
  expect(staticNode.isPageStack).toBe(false);
});
