import { test, expect } from "bun:test";
import { parseSitemapXml, sitemapToIa, fetchSitemap, siteNameFromXml } from "./sitemap";
import { parse } from "./parser";
import { join } from "path";
import { writeFileSync } from "fs";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";

const CLI = join(import.meta.dir, "index.ts");

test("parseSitemapXml extracts paths from sitemap XML", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://example.com/blog</loc></url>
  <url><loc>https://example.com/blog/post-1</loc></url>
</urlset>`;

  const entries = parseSitemapXml(xml);
  expect(entries).toHaveLength(4);
  expect(entries.map((e) => e.path).sort()).toEqual([
    "/",
    "/about",
    "/blog",
    "/blog/post-1",
  ]);
});

test("parseSitemapXml deduplicates paths", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://example.com/about/</loc></url>
  <url><loc>https://example.com/about?ref=nav</loc></url>
</urlset>`;

  const entries = parseSitemapXml(xml);
  expect(entries).toHaveLength(1);
  expect(entries[0].path).toBe("/about");
});

test("parseSitemapXml handles empty sitemap", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

  const entries = parseSitemapXml(xml);
  expect(entries).toHaveLength(0);
});

test("sitemapToIa generates valid .ia syntax", () => {
  const entries = [
    { path: "/" },
    { path: "/about" },
    { path: "/blog" },
    { path: "/blog/post-1" },
  ];

  const ia = sitemapToIa(entries, "example-com");

  expect(ia).toContain("site example-com");
  expect(ia).toContain("home /");
  expect(ia).toContain("about /about");
  expect(ia).toContain("blog /blog");
  expect(ia).toContain("post-1 /blog/post-1");

  // Verify it parses as valid .ia
  const diagram = parse(ia);
  expect(diagram.siteName).toBe("example-com");
  expect(diagram.nodes.length).toBeGreaterThan(0);
});

test("sitemapToIa organizes pages into hierarchy based on URL paths", () => {
  const entries = [
    { path: "/" },
    { path: "/docs" },
    { path: "/docs/getting-started" },
    { path: "/docs/api" },
  ];

  const ia = sitemapToIa(entries, "example-com");
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

test("siteNameFromXml extracts hostname from first loc", () => {
  const xml = `<urlset><url><loc>https://www.example.com/page</loc></url></urlset>`;
  expect(siteNameFromXml(xml, "fallback")).toBe("www-example-com");
});

test("siteNameFromXml uses fallback when no loc found", () => {
  const xml = `<urlset></urlset>`;
  expect(siteNameFromXml(xml, "my-site")).toBe("my-site");
});

test("fetchSitemap reads local file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sitemap-test-"));
  const file = join(dir, "sitemap.xml");
  writeFileSync(file, `<urlset><url><loc>https://example.com/</loc></url></urlset>`);

  try {
    const xml = await fetchSitemap(file);
    expect(xml).toContain("<loc>");
  } finally {
    await rm(dir, { recursive: true });
  }
});

test("sitemap CLI subcommand outputs valid .ia from local file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "sitemap-test-"));
  const file = join(dir, "sitemap.xml");
  writeFileSync(
    file,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://example.com/blog</loc></url>
  <url><loc>https://example.com/blog/post-1</loc></url>
</urlset>`
  );

  try {
    const proc = Bun.spawn(["bun", CLI, "sitemap", file], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    expect(exitCode).toBe(0);
    expect(stdout).toContain("site example-com");
    expect(stdout).toContain("home /");
    expect(stdout).toContain("about /about");
    expect(stdout).toContain("blog /blog");
    expect(stdout).toContain("post-1 /blog/post-1");

    // Output should be parseable
    const diagram = parse(stdout);
    expect(diagram.nodes.length).toBeGreaterThan(0);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test("sitemap CLI shows error for missing argument", async () => {
  const proc = Bun.spawn(["bun", CLI, "sitemap"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain("sitemap requires");
});
