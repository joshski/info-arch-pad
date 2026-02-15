export interface CrawlOptions {
  maxPages: number;
}

interface CrawledPage {
  url: string;
  path: string;
  linksTo: string[];
}

export async function crawl(
  startUrl: string,
  options: CrawlOptions
): Promise<CrawledPage[]> {
  const base = new URL(startUrl);
  const origin = base.origin;
  const visited = new Set<string>();
  const queue: string[] = [base.pathname];
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < options.maxPages) {
    const path = queue.shift()!;
    const normalized = normalizePath(path);
    if (visited.has(normalized)) continue;
    visited.add(normalized);

    const url = origin + normalized;
    let html: string;
    try {
      const response = await fetch(url);
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("text/html")
      ) {
        continue;
      }
      html = await response.text();
    } catch {
      continue;
    }

    const links = extractLinks(html, origin);
    pages.push({
      url,
      path: normalized,
      linksTo: links,
    });

    for (const link of links) {
      const normalizedLink = normalizePath(link);
      if (!visited.has(normalizedLink)) {
        queue.push(normalizedLink);
      }
    }
  }

  return pages;
}

function normalizePath(path: string): string {
  let normalized = path.split("?")[0].split("#")[0];
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized || "/";
}

function extractLinks(html: string, origin: string): string[] {
  const linkSet = new Set<string>();
  const hrefRegex = /href\s*=\s*"([^"]*?)"/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    try {
      let resolved: URL;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        resolved = new URL(href);
      } else if (href.startsWith("/")) {
        resolved = new URL(href, origin);
      } else {
        continue;
      }
      if (resolved.origin !== origin) continue;
      const path = normalizePath(resolved.pathname);
      linkSet.add(path);
    } catch {
      continue;
    }
  }
  return Array.from(linkSet);
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  linksTo: string[];
}

export function pagesToIa(
  pages: CrawledPage[],
  siteName: string
): string {
  const tree = buildTree(pages);
  const lines: string[] = [`site ${sanitizeName(siteName)}`];

  for (const node of tree) {
    renderNode(node, pages, 1, lines);
  }

  return lines.join("\n") + "\n";
}

function buildTree(pages: CrawledPage[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  const sortedPages = [...pages].sort((a, b) => {
    const aParts = a.path.split("/").filter(Boolean);
    const bParts = b.path.split("/").filter(Boolean);
    return aParts.length - bParts.length;
  });

  for (const page of sortedPages) {
    const segments = page.path.split("/").filter(Boolean);
    const name = pathToName(page.path);
    const node: TreeNode = {
      name,
      path: page.path,
      children: [],
      linksTo: page.linksTo,
    };
    nodeMap.set(page.path, node);

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

function pathToName(path: string): string {
  if (path === "/") return "home";
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return sanitizeName(last);
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
}

function renderNode(
  node: TreeNode,
  allPages: CrawledPage[],
  depth: number,
  lines: string[]
): void {
  const indent = "  ".repeat(depth);
  lines.push(`${indent}${node.name} ${node.path}`);

  const allNames = new Set<string>();
  function collectNames(pages: CrawledPage[]) {
    for (const p of pages) {
      allNames.add(pathToName(p.path));
    }
  }
  collectNames(allPages);

  for (const linkPath of node.linksTo) {
    const targetName = pathToName(linkPath);
    if (targetName !== node.name && allNames.has(targetName)) {
      lines.push(`${indent}  --> ${targetName}`);
    }
  }

  for (const child of node.children) {
    renderNode(child, allPages, depth + 1, lines);
  }
}
