import { test, expect } from "bun:test";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const CLI = join(import.meta.dir, "index.ts");

const SAMPLE_IA = `site MyApp
  home /
    [hero]
    --> products
  products /products
    product-detail /products/:id
  about /about
`;

test("outputs SVG to stdout", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  expect(stdout).toContain("<svg");
  expect(stdout).toContain("</svg>");
  expect(stdout).toContain("home");
  expect(stdout).toContain("products");

  await rm(dir, { recursive: true });
});

test("writes SVG to file with --output flag", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  const outputFile = join(dir, "output.svg");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile, "--output", outputFile], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;

  const svg = await readFile(outputFile, "utf-8");
  expect(svg).toContain("<svg");
  expect(svg).toContain("</svg>");

  await rm(dir, { recursive: true });
});

test("shows parse error with line and column", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "bad.ia");
  await writeFile(inputFile, "not valid dsl\n");

  const proc = Bun.spawn(["bun", CLI, inputFile], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain("Parse error");
  expect(stderr).toMatch(/line \d+/);
  expect(stderr).toMatch(/column \d+/);

  await rm(dir, { recursive: true });
});

test("shows usage when no arguments provided", async () => {
  const proc = Bun.spawn(["bun", CLI], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain("Usage:");
});

test("shows error for missing input file", async () => {
  const proc = Bun.spawn(["bun", CLI, "/nonexistent/file.ia"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain("Could not read file");
});
