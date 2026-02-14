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

test("applies dark theme with --theme flag", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile, "--theme", "dark"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  expect(exitCode).toBe(0);
  expect(stdout).toContain("<svg");
  // Dark theme node fill
  expect(stdout).toContain('fill="#1e1e2e"');
  // Should NOT contain default white fill
  expect(stdout).not.toContain('fill="#fff"');

  await rm(dir, { recursive: true });
});

test("writes PNG to file with --format png", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  const outputFile = join(dir, "output.png");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile, "--output", outputFile, "--format", "png"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;

  expect(exitCode).toBe(0);
  const png = await readFile(outputFile);
  // PNG magic bytes
  expect(png[0]).toBe(0x89);
  expect(png[1]).toBe(0x50); // P
  expect(png[2]).toBe(0x4e); // N
  expect(png[3]).toBe(0x47); // G

  await rm(dir, { recursive: true });
});

test("PNG renders at 2x resolution", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  const outputFile = join(dir, "output.png");
  await writeFile(inputFile, SAMPLE_IA);

  // Get SVG dimensions
  const svgProc = Bun.spawn(["bun", CLI, inputFile], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const svgOutput = await new Response(svgProc.stdout).text();
  await svgProc.exited;
  const widthMatch = svgOutput.match(/width="(\d+)"/);
  const heightMatch = svgOutput.match(/height="(\d+)"/);
  const svgWidth = parseInt(widthMatch![1]);
  const svgHeight = parseInt(heightMatch![1]);

  // Get PNG dimensions
  const pngProc = Bun.spawn(["bun", CLI, inputFile, "--output", outputFile, "--format", "png"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await pngProc.exited;
  const png = await readFile(outputFile);
  // PNG width and height are at bytes 16-23 as big-endian 32-bit integers
  const pngWidth = png.readUInt32BE(16);
  const pngHeight = png.readUInt32BE(20);

  expect(pngWidth).toBe(svgWidth * 2);
  expect(pngHeight).toBe(svgHeight * 2);

  await rm(dir, { recursive: true });
});

test("shows error for unknown format", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile, "--format", "bmp"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain('Unknown format "bmp"');

  await rm(dir, { recursive: true });
});

test("--watch re-renders when input file changes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  const outputFile = join(dir, "output.svg");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile, "--output", outputFile, "--watch"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  // Wait for initial render
  await new Promise((resolve) => setTimeout(resolve, 500));
  const svg1 = await readFile(outputFile, "utf-8");
  expect(svg1).toContain("<svg");
  expect(svg1).toContain("home");

  // Modify input file
  const updatedIA = SAMPLE_IA.replace("home", "dashboard");
  await writeFile(inputFile, updatedIA);

  // Wait for re-render
  await new Promise((resolve) => setTimeout(resolve, 500));
  const svg2 = await readFile(outputFile, "utf-8");
  expect(svg2).toContain("dashboard");
  expect(svg2).not.toContain("home");

  // Check stderr for render messages
  proc.kill();
  const stderr = await new Response(proc.stderr).text();
  expect(stderr).toContain("Rendered");
  expect(stderr).toContain("Watching for changes");

  await rm(dir, { recursive: true });
});

test("shows error for unknown theme", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ia-test-"));
  const inputFile = join(dir, "test.ia");
  await writeFile(inputFile, SAMPLE_IA);

  const proc = Bun.spawn(["bun", CLI, inputFile, "--theme", "nope"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  expect(exitCode).not.toBe(0);
  expect(stderr).toContain('Unknown theme "nope"');
  expect(stderr).toContain("default");
  expect(stderr).toContain("dark");

  await rm(dir, { recursive: true });
});
