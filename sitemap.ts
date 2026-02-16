import { readFileSync } from "fs";

interface SitemapEntry {
  path: string;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
}

export async function fetchSitemap(urlOrFile: string): Promise<string> {
  if (urlOrFile.startsWith("http://") || urlOrFile.startsWith("https://")) {
    const response = await fetch(urlOrFile);
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
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

function normalizePath(path: string): string {
  let normalized = path.split("?")[0].split("#")[0];
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized || "/";
}

function pathToName(path: string): string {
  if (path === "/") return "home";
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return sanitizeName(last);
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
}

function buildTree(entries: SitemapEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  const sorted = [...entries].sort((a, b) => {
    const aParts = a.path.split("/").filter(Boolean);
    const bParts = b.path.split("/").filter(Boolean);
    return aParts.length - bParts.length;
  });

  for (const entry of sorted) {
    const segments = entry.path.split("/").filter(Boolean);
    const name = pathToName(entry.path);
    const node: TreeNode = { name, path: entry.path, children: [] };
    nodeMap.set(entry.path, node);

    let placed = false;
    for (let i = segments.length - 1; i > 0; i--) {
      const parentPath = "/" + segments.slice(0, i).join("/");
      const parent = nodeMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
        placed = true;
        break;
      }
    }
    if (!placed) {
      root.push(node);
    }
  }

  return root;
}

function renderNode(node: TreeNode, depth: number, lines: string[]): void {
  const indent = "  ".repeat(depth);
  lines.push(`${indent}${node.name} ${node.path}`);
  for (const child of node.children) {
    renderNode(child, depth + 1, lines);
  }
}

export function sitemapToIa(entries: SitemapEntry[], siteName: string): string {
  const tree = buildTree(entries);
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
