import { readFileSync, writeFileSync, watch } from "fs";
import { parse } from "./parser";
import { layout } from "./layout";
import { render } from "./renderer";
import { themes } from "./theme";
import type { Theme } from "./theme";
import { crawl, pagesToIa } from "./crawl";

const args = process.argv.slice(2);

function printUsage() {
  console.error("Usage: bun run index.ts <input-file> [--output <file>] [--theme <name>] [--format svg|png|html] [--watch]");
  console.error("       bun run index.ts crawl <url> [--max-pages <n>] [--output <file>]");
}

if (args.length === 0) {
  printUsage();
  process.exit(1);
}

if (args[0] === "crawl") {
  const crawlUrl = args[1];
  if (!crawlUrl) {
    console.error("Error: crawl requires a URL argument");
    console.error("Usage: bun run index.ts crawl <url> [--max-pages <n>] [--output <file>]");
    process.exit(1);
  }

  let maxPages = 50;
  let crawlOutputFile: string | undefined;
  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--max-pages" && i + 1 < args.length) {
      maxPages = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--output" && i + 1 < args.length) {
      crawlOutputFile = args[i + 1];
      i++;
    }
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(crawlUrl);
  } catch {
    console.error(`Error: Invalid URL "${crawlUrl}"`);
    process.exit(1);
  }

  const pages = await crawl(crawlUrl, { maxPages });
  if (pages.length === 0) {
    console.error("Error: No pages were crawled");
    process.exit(1);
  }

  const siteName = parsedUrl.hostname.replace(/\./g, "-");
  const ia = pagesToIa(pages, siteName);

  if (crawlOutputFile) {
    writeFileSync(crawlOutputFile, ia, "utf-8");
  } else {
    process.stdout.write(ia);
  }
  process.exit(0);
}

const inputFile = args[0];
let outputFile: string | undefined;
let themeName: string = "default";
let format: string = "svg";
let watchMode: boolean = false;

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--output" && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === "--theme" && i + 1 < args.length) {
    themeName = args[i + 1];
    i++;
  } else if (args[i] === "--format" && i + 1 < args.length) {
    format = args[i + 1];
    i++;
  } else if (args[i] === "--watch") {
    watchMode = true;
  }
}

const theme = themes[themeName];
if (!theme) {
  console.error(`Error: Unknown theme "${themeName}". Available themes: ${Object.keys(themes).join(", ")}`);
  process.exit(1);
}

if (format !== "svg" && format !== "png" && format !== "html") {
  console.error(`Error: Unknown format "${format}". Available formats: svg, png, html`);
  process.exit(1);
}

function wrapSvgInHtml(svg: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Information Architecture</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #f0f0f0; }
  #container {
    width: 100%; height: 100%;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #container.grabbing { cursor: grabbing; }
  #diagram {
    transform-origin: 0 0;
  }
</style>
</head>
<body>
<div id="container">
  <div id="diagram">
    ${svg}
  </div>
</div>
<script>
(function() {
  const container = document.getElementById('container');
  const diagram = document.getElementById('diagram');
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  function fitToViewport() {
    const svgEl = diagram.querySelector('svg');
    if (!svgEl) return;
    const svgW = svgEl.getAttribute('width') || svgEl.viewBox.baseVal.width;
    const svgH = svgEl.getAttribute('height') || svgEl.viewBox.baseVal.height;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    const padding = 40;
    scale = Math.min((cW - padding) / svgW, (cH - padding) / svgH, 1);
    translateX = (cW - svgW * scale) / 2;
    translateY = (cH - svgH * scale) / 2;
    applyTransform();
  }

  function applyTransform() {
    diagram.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
  }

  container.addEventListener('wheel', function(e) {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const prevScale = scale;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale *= delta;
    scale = Math.max(0.1, Math.min(scale, 10));
    translateX = mouseX - (mouseX - translateX) * (scale / prevScale);
    translateY = mouseY - (mouseY - translateY) * (scale / prevScale);
    applyTransform();
  }, { passive: false });

  container.addEventListener('mousedown', function(e) {
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    container.classList.add('grabbing');
  });

  window.addEventListener('mousemove', function(e) {
    if (!isPanning) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', function() {
    isPanning = false;
    container.classList.remove('grabbing');
  });

  fitToViewport();
})();
</script>
</body>
</html>`;
}

async function renderFile(inputFile: string, outputFile: string | undefined, format: string, theme: Theme): Promise<boolean> {
  let source: string;
  try {
    source = readFileSync(inputFile, "utf-8");
  } catch {
    console.error(`Error: Could not read file "${inputFile}"`);
    return false;
  }

  let diagram;
  try {
    diagram = parse(source);
  } catch (e: any) {
    if (e.location) {
      const loc = e.location.start;
      console.error(
        `Parse error at line ${loc.line}, column ${loc.column}: ${e.message}`
      );
    } else {
      console.error(`Parse error: ${e.message}`);
    }
    return false;
  }

  const positioned = layout(diagram);
  const svg = render(positioned, theme);

  if (format === "png") {
    const { Resvg } = await import("@resvg/resvg-js");
    const resvg = new Resvg(svg, {
      fitTo: { mode: "zoom", value: 2 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    if (outputFile) {
      writeFileSync(outputFile, pngBuffer);
    } else {
      process.stdout.write(pngBuffer);
    }
  } else if (format === "html") {
    const html = wrapSvgInHtml(svg);
    if (outputFile) {
      writeFileSync(outputFile, html, "utf-8");
    } else {
      process.stdout.write(html);
    }
  } else {
    if (outputFile) {
      writeFileSync(outputFile, svg, "utf-8");
    } else {
      process.stdout.write(svg);
    }
  }

  return true;
}

const ok = await renderFile(inputFile, outputFile, format, theme);

if (watchMode) {
  if (ok) {
    console.error(`Rendered ${inputFile}. Watching for changes...`);
  }
  watch(inputFile, async (eventType) => {
    if (eventType === "change") {
      const ok = await renderFile(inputFile, outputFile, format, theme);
      if (ok) {
        console.error(`Rendered ${inputFile}`);
      }
    }
  });
} else if (!ok) {
  process.exit(1);
}
