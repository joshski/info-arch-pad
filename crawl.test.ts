import { test, expect } from "bun:test";
import { crawl, pagesToIa } from "./crawl";
import { parse } from "./parser";
import { join } from "path";

const CLI = join(import.meta.dir, "index.ts");

function serve(
  pages: Record<string, string>
): { server: ReturnType<typeof Bun.serve>; origin: string } {
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      const html = pages[url.pathname];
      if (html) {
        return new Response(html, {
          headers: { "content-type": "text/html" },
        });
      }
      return new Response("Not found", { status: 404 });
    },
  });
  return { server, origin: `http://localhost:${server.port}` };
}

test("crawls pages and follows internal links", async () => {
  const { server, origin } = serve({
    "/": `<html><body><a href="/about">About</a><a href="/blog">Blog</a></body></html>`,
    "/about": `<html><body><a href="/">Home</a></body></html>`,
    "/blog": `<html><body><a href="/">Home</a><a href="/about">About</a></body></html>`,
  });

  try {
    const pages = await crawl(origin, { maxPages: 50 });
    expect(pages).toHaveLength(3);
    const paths = pages.map((p) => p.path).sort();
    expect(paths).toEqual(["/", "/about", "/blog"]);
  } finally {
    server.stop();
  }
});

test("respects max-pages limit", async () => {
  const { server, origin } = serve({
    "/": `<html><body><a href="/a">A</a><a href="/b">B</a><a href="/c">C</a></body></html>`,
    "/a": `<html><body>A</body></html>`,
    "/b": `<html><body>B</body></html>`,
    "/c": `<html><body>C</body></html>`,
  });

  try {
    const pages = await crawl(origin, { maxPages: 2 });
    expect(pages).toHaveLength(2);
  } finally {
    server.stop();
  }
});

test("ignores external links", async () => {
  const { server, origin } = serve({
    "/": `<html><body><a href="/about">About</a><a href="https://external.com">External</a></body></html>`,
    "/about": `<html><body>About</body></html>`,
  });

  try {
    const pages = await crawl(origin, { maxPages: 50 });
    expect(pages).toHaveLength(2);
    const paths = pages.map((p) => p.path);
    expect(paths).not.toContain("https://external.com");
  } finally {
    server.stop();
  }
});

test("normalizes trailing slashes and query strings", async () => {
  const { server, origin } = serve({
    "/": `<html><body><a href="/about/">About</a><a href="/about?foo=bar">About2</a></body></html>`,
    "/about": `<html><body>About</body></html>`,
  });

  try {
    const pages = await crawl(origin, { maxPages: 50 });
    expect(pages).toHaveLength(2);
  } finally {
    server.stop();
  }
});

test("resolves realistic relative links from parsed HTML", async () => {
  const { server, origin } = serve({
    "/": `<html><body><a href="/docs/">Docs</a><a href="/contact?via=nav">Contact</a></body></html>`,
    "/docs/": `<html><head><base href="/docs/"></head><body><a HREF='getting-started/'>Start</a><a href='./api?version=1#top'>API</a><a href='../contact#team'>Contact</a><a href='mailto:test@example.com'>Mail</a></body></html>`,
    "/docs/getting-started/": `<html><body>Start</body></html>`,
    "/docs/api": `<html><body>API</body></html>`,
    "/contact": `<html><body>Contact</body></html>`,
  });

  try {
    const pages = await crawl(origin, { maxPages: 50 });
    expect(pages.map((page) => page.path).sort()).toEqual([
      "/",
      "/contact",
      "/docs",
      "/docs/api",
      "/docs/getting-started",
    ]);

    const docsPage = pages.find((page) => page.path === "/docs");
    expect(docsPage?.linksTo).toEqual([
      "/docs/getting-started",
      "/docs/api",
      "/contact",
    ]);
  } finally {
    server.stop();
  }
});

test("pagesToIa generates valid .ia syntax from crawled pages", () => {
  const pages = [
    { url: "http://example.com/", path: "/", linksTo: ["/about", "/blog"] },
    { url: "http://example.com/about", path: "/about", linksTo: ["/"] },
    {
      url: "http://example.com/blog",
      path: "/blog",
      linksTo: ["/", "/blog/post-1"],
    },
    {
      url: "http://example.com/blog/post-1",
      path: "/blog/post-1",
      linksTo: ["/blog"],
    },
  ];

  const ia = pagesToIa(pages, "example-com");

  expect(ia).toContain("site example-com");
  expect(ia).toContain("home /");
  expect(ia).toContain("about /about");
  expect(ia).toContain("blog /blog");
  expect(ia).toContain("post-1 /blog/post-1");

  // Verify links are present
  expect(ia).toContain("--> about");
  expect(ia).toContain("--> blog");
  expect(ia).toContain("--> home");

  // Verify it parses as valid .ia
  const diagram = parse(ia);
  expect(diagram.siteName).toBe("example-com");
  expect(diagram.nodes.length).toBeGreaterThan(0);
});

test("pagesToIa organizes pages into hierarchy based on URL paths", () => {
  const pages = [
    { url: "http://example.com/", path: "/", linksTo: [] },
    { url: "http://example.com/docs", path: "/docs", linksTo: [] },
    {
      url: "http://example.com/docs/getting-started",
      path: "/docs/getting-started",
      linksTo: [],
    },
    {
      url: "http://example.com/docs/api",
      path: "/docs/api",
      linksTo: [],
    },
  ];

  const ia = pagesToIa(pages, "example-com");

  // docs/getting-started and docs/api should be children of docs
  const lines = ia.split("\n");
  const docsLine = lines.find((l) => l.trim().startsWith("docs /docs"));
  const gettingStartedLine = lines.find((l) =>
    l.trim().startsWith("getting-started")
  );
  const apiLine = lines.find((l) => l.trim().startsWith("api /docs/api"));

  expect(docsLine).toBeDefined();
  expect(gettingStartedLine).toBeDefined();
  expect(apiLine).toBeDefined();

  // Children should be more indented than parent
  const docsIndent = docsLine!.search(/\S/);
  const childIndent = gettingStartedLine!.search(/\S/);
  expect(childIndent).toBeGreaterThan(docsIndent);
});

test("crawl CLI subcommand outputs valid .ia", async () => {
  const { server, origin } = serve({
    "/": `<html><body><a href="/about">About</a></body></html>`,
    "/about": `<html><body><a href="/">Home</a></body></html>`,
  });

  try {
    const proc = Bun.spawn(["bun", CLI, "crawl", origin, "--max-pages", "10"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    expect(exitCode).toBe(0);
    expect(stdout).toContain("site ");
    expect(stdout).toContain("home /");
    expect(stdout).toContain("about /about");

    // Output should be parseable
    const diagram = parse(stdout);
    expect(diagram.nodes.length).toBeGreaterThan(0);
  } finally {
    server.stop();
  }
});

test("crawl CLI shows error for missing URL", async () => {
  const proc = Bun.spawn(["bun", CLI, "crawl"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain("crawl requires a URL");
});

test("crawl CLI shows error for invalid URL", async () => {
  const proc = Bun.spawn(["bun", CLI, "crawl", "not-a-url"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain("Invalid URL");
});
