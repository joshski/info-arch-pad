import { readFileSync, writeFileSync } from "fs";
import { parse } from "./parser";
import { layout } from "./layout";
import { render } from "./renderer";
import { themes } from "./theme";

const args = process.argv.slice(2);

function printUsage() {
  console.error("Usage: bun run index.ts <input-file> [--output <file>] [--theme <name>]");
}

if (args.length === 0) {
  printUsage();
  process.exit(1);
}

const inputFile = args[0];
let outputFile: string | undefined;
let themeName: string = "default";

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--output" && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === "--theme" && i + 1 < args.length) {
    themeName = args[i + 1];
    i++;
  }
}

const theme = themes[themeName];
if (!theme) {
  console.error(`Error: Unknown theme "${themeName}". Available themes: ${Object.keys(themes).join(", ")}`);
  process.exit(1);
}

let source: string;
try {
  source = readFileSync(inputFile, "utf-8");
} catch {
  console.error(`Error: Could not read file "${inputFile}"`);
  process.exit(1);
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
  process.exit(1);
}

const positioned = layout(diagram);
const svg = render(positioned, theme);

if (outputFile) {
  writeFileSync(outputFile, svg, "utf-8");
} else {
  process.stdout.write(svg);
}
