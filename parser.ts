import { readFileSync } from "node:fs";
import peggy from "peggy";
import type { IADiagram, IANode } from "./model";

const grammarSource = readFileSync(new URL("./ia.pegjs", import.meta.url), "utf8");

const parser = peggy.generate(grammarSource);

function collectNodeNames(nodes: IANode[]): Set<string> {
  const names = new Set<string>();
  for (const node of nodes) {
    names.add(node.name);
    for (const name of collectNodeNames(node.children)) {
      names.add(name);
    }
  }
  return names;
}

function validateLinkTargets(diagram: IADiagram): void {
  // Collect node names across all sites for cross-site link support
  const allNodeNames = new Set<string>();
  for (const site of diagram.sites) {
    for (const name of collectNodeNames(site.nodes)) {
      allNodeNames.add(name);
    }
  }

  const errors: string[] = [];

  function checkNode(node: IANode): void {
    for (const link of node.links) {
      if (!link.url && !allNodeNames.has(link.target)) {
        errors.push(`Node "${node.name}" has a link to unknown target "${link.target}"`);
      }
    }
    for (const child of node.children) {
      checkNode(child);
    }
  }

  for (const site of diagram.sites) {
    for (const node of site.nodes) {
      checkNode(node);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

export function parse(input: string): IADiagram {
  // Ensure input ends with a newline for the grammar
  const normalized = input.endsWith("\n") ? input : input + "\n";
  const diagram = parser.parse(normalized) as IADiagram;
  validateLinkTargets(diagram);
  return diagram;
}
