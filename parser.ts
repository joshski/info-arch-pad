import peggy from "peggy";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { IADiagram } from "./model";

const __dirname = dirname(fileURLToPath(import.meta.url));
const grammarSource = readFileSync(join(__dirname, "ia.pegjs"), "utf-8");
const parser = peggy.generate(grammarSource);

export function parse(input: string): IADiagram {
  // Ensure input ends with a newline for the grammar
  const normalized = input.endsWith("\n") ? input : input + "\n";
  return parser.parse(normalized) as IADiagram;
}
