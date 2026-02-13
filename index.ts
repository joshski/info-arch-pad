import { readFileSync, writeFileSync } from "fs";
import { parse } from "./parser";
import { layout } from "./layout";
import { render } from "./renderer";

const args = process.argv.slice(2);

function printUsage() {
  console.error("Usage: bun run index.ts <input-file> [--output <file>]");
}

if (args.length === 0) {
  printUsage();
  process.exit(1);
}

const inputFile = args[0];
let outputFile: string | undefined;

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--output" && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  }
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
const svg = render(positioned);

if (outputFile) {
  writeFileSync(outputFile, svg, "utf-8");
} else {
  process.stdout.write(svg);
}
