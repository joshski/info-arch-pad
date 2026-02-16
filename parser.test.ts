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
  about /about
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

test("parses external links", () => {
  const result = parse(`
site MyApp
  home /
    ---> https://stripe.com/api
    ---> https://example.com/webhook
`);
  expect(result.nodes[0].links).toHaveLength(2);
  expect(result.nodes[0].links[0].url).toBe("https://stripe.com/api");
  expect(result.nodes[0].links[1].url).toBe("https://example.com/webhook");
});

test("validates that link targets reference existing nodes", () => {
  expect(() =>
    parse(`
site MyApp
  home /
    --> nonexistent
  products /products
`)
  ).toThrow('Node "home" has a link to unknown target "nonexistent"');
});

test("reports multiple invalid link targets", () => {
  expect(() =>
    parse(`
site MyApp
  home /
    --> ghost
    --> phantom
`)
  ).toThrow('Node "home" has a link to unknown target "ghost"');
});

test("allows valid links without errors", () => {
  const result = parse(`
site MyApp
  home /
    --> products
  products /products
    --> home
`);
  expect(result.nodes[0].links[0].target).toBe("products");
  expect(result.nodes[1].links[0].target).toBe("home");
});

test("allows diagrams with no links", () => {
  const result = parse(`
site MyApp
  home /
  about /about
`);
  expect(result.nodes[0].links).toEqual([]);
  expect(result.nodes[1].links).toEqual([]);
});

test("does not validate external link targets as node names", () => {
  const result = parse(`
site MyApp
  home /
    ---> https://example.com
`);
  expect(result.nodes[0].links[0].url).toBe("https://example.com");
});

test("validates links to deeply nested nodes", () => {
  const result = parse(`
site MyApp
  home /
    --> detail
  products /products
    detail /products/:id
`);
  expect(result.nodes[0].links[0].target).toBe("detail");
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
  expect(result.nodes[0].notes).toEqual([]);
});

test("parses notes on page nodes", () => {
  const result = parse(`
site MyApp
  home /
    -- "This is the landing page"
    -- "Needs hero section"
`);
  expect(result.nodes[0].notes).toHaveLength(2);
  expect(result.nodes[0].notes[0]).toBe("This is the landing page");
  expect(result.nodes[0].notes[1]).toBe("Needs hero section");
});

test("parses notes alongside components and links", () => {
  const result = parse(`
site MyApp
  home /
    [hero]
    -- "Primary entry point"
    --> about
  about /about
`);
  expect(result.nodes[0].components).toEqual(["hero"]);
  expect(result.nodes[0].notes).toEqual(["Primary entry point"]);
  expect(result.nodes[0].links).toHaveLength(1);
});

test("parses multiple site blocks", () => {
  const result = parse(`
site Current
  home /
  about /about

site Proposed
  home /
  products /products
`);
  expect(result.sites).toHaveLength(2);
  expect(result.sites[0].siteName).toBe("Current");
  expect(result.sites[0].nodes).toHaveLength(2);
  expect(result.sites[1].siteName).toBe("Proposed");
  expect(result.sites[1].nodes).toHaveLength(2);
  // backward compat: siteName and nodes reflect first site
  expect(result.siteName).toBe("Current");
  expect(result.nodes).toHaveLength(2);
});

test("single site populates sites array", () => {
  const result = parse(`
site MyApp
  home /
`);
  expect(result.sites).toHaveLength(1);
  expect(result.sites[0].siteName).toBe("MyApp");
  expect(result.sites[0].nodes).toHaveLength(1);
});

test("validates cross-site links", () => {
  const result = parse(`
site SiteA
  home /
    --> products

site SiteB
  products /products
`);
  expect(result.sites[0].nodes[0].links[0].target).toBe("products");
});

test("rejects invalid cross-site link targets", () => {
  expect(() =>
    parse(`
site SiteA
  home /
    --> nonexistent

site SiteB
  products /products
`)
  ).toThrow('Node "home" has a link to unknown target "nonexistent"');
});
