import { readFileSync } from "fs";
import {
  buildPathTree,
  normalizePath,
  sanitizeName,
  type PathTreeNode,
} from "./site-structure";

interface SitemapEntry {
  path: string;
}

export async function fetchSitemap(urlOrFile: string): Promise<string> {
  if (urlOrFile.startsWith("http://") || urlOrFile.startsWith("https://")) {
    const response = await fetch(urlOrFile);
    if (!response.ok) {
      const statusDetail = response.statusText
        ? `${response.status} ${response.statusText}`
        : String(response.status);
      throw new Error(`HTTP ${statusDetail} from ${response.url || urlOrFile}`);
    }
    return await response.text();
  }
  return readFileSync(urlOrFile, "utf-8");
}

export function parseSitemapXml(xml: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    const urlStr = match[1];
    try {
      const url = new URL(urlStr);
      entries.push({ path: normalizePath(url.pathname) });
    } catch {
      continue;
    }
  }
  return dedup(entries);
}

function dedup(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });
}

function renderNode(
  node: PathTreeNode<SitemapEntry>,
  depth: number,
  lines: string[]
): void {
  const indent = "  ".repeat(depth);
  lines.push(`${indent}${node.name} ${node.path}`);
  for (const child of node.children) {
    renderNode(child, depth + 1, lines);
  }
}

export function sitemapToIa(entries: SitemapEntry[], siteName: string): string {
  const tree = buildPathTree(entries);
  const lines: string[] = [`site ${sanitizeName(siteName)}`];
  for (const node of tree) {
    renderNode(node, 1, lines);
  }
  return lines.join("\n") + "\n";
}

export function siteNameFromXml(xml: string, fallback: string): string {
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/i;
  const match = locRegex.exec(xml);
  if (match) {
    try {
      return new URL(match[1]).hostname.replace(/\./g, "-");
    } catch {}
  }
  return sanitizeName(fallback);
}
