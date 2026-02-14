import { readFileSync, writeFileSync, watch } from "fs";
import { parse } from "./parser";
import { layout } from "./layout";
import { render } from "./renderer";
import { themes } from "./theme";
import type { Theme } from "./theme";

const args = process.argv.slice(2);

function printUsage() {
  console.error("Usage: bun run index.ts <input-file> [--output <file>] [--theme <name>] [--format svg|png] [--watch]");
}

if (args.length === 0) {
  printUsage();
  process.exit(1);
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

if (format !== "svg" && format !== "png") {
  console.error(`Error: Unknown format "${format}". Available formats: svg, png`);
  process.exit(1);
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
