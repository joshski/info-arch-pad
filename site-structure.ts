export interface PathEntry {
  path: string;
}

export interface PathTreeNode<T extends PathEntry> {
  entry: T;
  name: string;
  path: string;
  children: PathTreeNode<T>[];
}

export function normalizePath(path: string): string {
  let normalized = path.split("?")[0].split("#")[0];
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized || "/";
}

export function pathToName(path: string): string {
  if (path === "/") return "home";
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return sanitizeName(last);
}

export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
}

export function buildPathTree<T extends PathEntry>(entries: T[]): PathTreeNode<T>[] {
  const root: PathTreeNode<T>[] = [];
  const nodeMap = new Map<string, PathTreeNode<T>>();

  const sortedEntries = [...entries].sort((a, b) => {
    const aParts = a.path.split("/").filter(Boolean);
    const bParts = b.path.split("/").filter(Boolean);
    return aParts.length - bParts.length;
  });

  for (const entry of sortedEntries) {
    const segments = entry.path.split("/").filter(Boolean);
    const node: PathTreeNode<T> = {
      entry,
      name: pathToName(entry.path),
      path: entry.path,
      children: [],
    };
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
