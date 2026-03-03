import {
  buildPathTree,
  normalizePath,
  pathToName,
  sanitizeName,
  type PathTreeNode,
} from "./site-structure";

export interface CrawlOptions {
  maxPages: number;
}

interface CrawledPage {
  url: string;
  path: string;
  linksTo: string[];
}

interface DiscoveredLink {
  url: URL;
  path: string;
}

export async function crawl(
  startUrl: string,
  options: CrawlOptions
): Promise<CrawledPage[]> {
  const base = new URL(startUrl);
  const visited = new Set<string>();
  const queue: URL[] = [base];
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < options.maxPages) {
    const currentUrl = queue.shift()!;
    const normalized = normalizePath(currentUrl.pathname);
    if (visited.has(normalized)) continue;
    visited.add(normalized);

    let pageUrl = currentUrl;
    let html = await fetchHtml(pageUrl);
    if (html === null && normalized !== currentUrl.pathname) {
      pageUrl = new URL(normalized, currentUrl.origin);
      html = await fetchHtml(pageUrl);
    }

    if (html === null) {
      continue;
    }

    const links = await extractLinks(html, pageUrl);
    pages.push({
      url: pageUrl.toString(),
      path: normalized,
      linksTo: links.map((link) => link.path),
    });

    for (const link of links) {
      if (!visited.has(link.path)) {
        queue.push(link.url);
      }
    }
  }

  return pages;
}

async function fetchHtml(url: URL): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("text/html")
    ) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

async function extractLinks(
  html: string,
  pageUrl: URL
): Promise<DiscoveredLink[]> {
  let resolveFrom = pageUrl;
  const linkMap = new Map<string, URL>();

  function recordLink(href: string | null): void {
    if (!href) return;

    try {
      const resolved = new URL(href, resolveFrom);
      if (
        (resolved.protocol !== "http:" && resolved.protocol !== "https:") ||
        resolved.origin !== pageUrl.origin
      ) {
        return;
      }

      const path = normalizePath(resolved.pathname);
      if (!linkMap.has(path)) {
        linkMap.set(path, resolved);
      }
    } catch {
      return;
    }
  }

  await new HTMLRewriter()
    .on("base[href]", {
      element(element) {
        const href = element.getAttribute("href");
        if (!href) return;

        try {
          resolveFrom = new URL(href, pageUrl);
        } catch {
          resolveFrom = pageUrl;
        }
      },
    })
    .on("a[href]", {
      element(element) {
        recordLink(element.getAttribute("href"));
      },
    })
    .on("area[href]", {
      element(element) {
        recordLink(element.getAttribute("href"));
      },
    })
    .transform(new Response(html)).text();

  return Array.from(linkMap, ([path, url]) => ({ path, url }));
}

export function pagesToIa(
  pages: CrawledPage[],
  siteName: string
): string {
  const tree = buildPathTree(pages);
  const lines: string[] = [`site ${sanitizeName(siteName)}`];
  const allNames = new Set(pages.map((page) => pathToName(page.path)));

  for (const node of tree) {
    renderNode(node, allNames, 1, lines);
  }

  return lines.join("\n") + "\n";
}

function renderNode(
  node: PathTreeNode<CrawledPage>,
  allNames: Set<string>,
  depth: number,
  lines: string[]
): void {
  const indent = "  ".repeat(depth);
  lines.push(`${indent}${node.name} ${node.path}`);

  for (const linkPath of node.entry.linksTo) {
    const targetName = pathToName(linkPath);
    if (targetName !== node.name && allNames.has(targetName)) {
      lines.push(`${indent}  --> ${targetName}`);
    }
  }

  for (const child of node.children) {
    renderNode(child, allNames, depth + 1, lines);
  }
}
