import { test, expect } from "bun:test";
import { parse } from "./parser";

test("parses minimal hierarchy", () => {
  const result = parse(`
site MyApp
  home /
  products /products
    product-list
    product-detail /products/:id
  about /about
    team
    contact /contact
`);
  expect(result.siteName).toBe("MyApp");
  expect(result.nodes).toHaveLength(3);
  expect(result.nodes[0].name).toBe("home");
  expect(result.nodes[0].path).toBe("/");
  expect(result.nodes[1].name).toBe("products");
  expect(result.nodes[1].path).toBe("/products");
  expect(result.nodes[1].children).toHaveLength(2);
  expect(result.nodes[1].children[0].name).toBe("product-list");
  expect(result.nodes[1].children[0].path).toBeUndefined();
  expect(result.nodes[1].children[1].name).toBe("product-detail");
  expect(result.nodes[1].children[1].path).toBe("/products/:id");
  expect(result.nodes[2].name).toBe("about");
  expect(result.nodes[2].children).toHaveLength(2);
  expect(result.nodes[2].children[0].name).toBe("team");
  expect(result.nodes[2].children[1].name).toBe("contact");
  expect(result.nodes[2].children[1].path).toBe("/contact");
});

test("parses navigation links", () => {
  const result = parse(`
site MyApp
  home /
    --> products
    --> about
  products /products
    --> home
`);
  expect(result.nodes[0].links).toHaveLength(2);
  expect(result.nodes[0].links[0].target).toBe("products");
  expect(result.nodes[0].links[1].target).toBe("about");
  expect(result.nodes[1].links).toHaveLength(1);
  expect(result.nodes[1].links[0].target).toBe("home");
});

test("parses annotations", () => {
  const result = parse(`
site MyApp
  home / (landing-page)
  products /products (listing-page)
`);
  expect(result.nodes[0].annotation).toBe("landing-page");
  expect(result.nodes[1].annotation).toBe("listing-page");
});

test("flags dynamic routes as page stacks", () => {
  const result = parse(`
site MyApp
  products /products
    product-detail /products/:id
`);
  expect(result.nodes[0].isPageStack).toBe(false);
  expect(result.nodes[0].children[0].isPageStack).toBe(true);
});

test("parses components", () => {
  const result = parse(`
site MyApp
  home /
    [hero]
    [featured-products]
`);
  expect(result.nodes[0].components).toHaveLength(2);
  expect(result.nodes[0].components[0]).toBe("hero");
  expect(result.nodes[0].components[1]).toBe("featured-products");
});

test("parses the full example with links and components", () => {
  const result = parse(`
site MyApp
  home / (landing-page)
    [hero]
    [featured-products]
    --> products
    --> about

  products /products (listing-page)
    [filters]
    [product-card *]
    product-detail /products/:id (detail-page)
      [gallery]
      [specs]
      [reviews]
      --> home

  about /about
    team /about/team
    contact /contact
`);
  expect(result.siteName).toBe("MyApp");
  expect(result.nodes).toHaveLength(3);

  const home = result.nodes[0];
  expect(home.annotation).toBe("landing-page");
  expect(home.components).toEqual(["hero", "featured-products"]);
  expect(home.links).toHaveLength(2);

  const products = result.nodes[1];
  expect(products.annotation).toBe("listing-page");
  expect(products.components).toEqual(["filters", "product-card *"]);
  expect(products.children).toHaveLength(1);

  const detail = products.children[0];
  expect(detail.name).toBe("product-detail");
  expect(detail.isPageStack).toBe(true);
  expect(detail.annotation).toBe("detail-page");
  expect(detail.components).toEqual(["gallery", "specs", "reviews"]);
  expect(detail.links).toHaveLength(1);
  expect(detail.links[0].target).toBe("home");

  const about = result.nodes[2];
  expect(about.children).toHaveLength(2);
});

test("nodes without paths or annotations have undefined for those fields", () => {
  const result = parse(`
site MyApp
  dashboard
`);
  expect(result.nodes[0].name).toBe("dashboard");
  expect(result.nodes[0].path).toBeUndefined();
  expect(result.nodes[0].annotation).toBeUndefined();
  expect(result.nodes[0].isPageStack).toBe(false);
  expect(result.nodes[0].children).toEqual([]);
  expect(result.nodes[0].links).toEqual([]);
  expect(result.nodes[0].components).toEqual([]);
});
