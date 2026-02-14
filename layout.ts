import type { IADiagram, IANode } from "./model";

export interface LayoutNode {
  name: string;
  path?: string;
  annotation?: string;
  isPageStack: boolean;
  components: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
}

export interface LayoutEdge {
  fromNode: string;
  toNode: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  url?: string;
}

export interface Layout {
  siteName: string;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

const CHAR_WIDTH = 8;
const NODE_PADDING_X = 20;
const NODE_PADDING_Y = 10;
const LINE_HEIGHT = 16;
const SIBLING_GAP = 30;
const LEVEL_GAP = 60;
const SECTION_PADDING = 20;

function textWidth(text: string): number {
  return text.length * CHAR_WIDTH;
}

function nodeContentWidth(node: IANode): number {
  let maxWidth = textWidth(node.name);
  if (node.path) {
    maxWidth = Math.max(maxWidth, textWidth(node.path));
  }
  if (node.annotation) {
    maxWidth = Math.max(maxWidth, textWidth(node.annotation));
  }
  for (const comp of node.components) {
    maxWidth = Math.max(maxWidth, textWidth(`[${comp}]`));
  }
  return maxWidth + NODE_PADDING_X * 2;
}

function nodeContentHeight(node: IANode): number {
  let lines = 1; // name
  if (node.path) lines++;
  if (node.annotation) lines++;
  lines += node.components.length;
  return lines * LINE_HEIGHT + NODE_PADDING_Y * 2;
}

function layoutSubtree(node: IANode, x: number, y: number): LayoutNode {
  const hasChildren = node.children.length > 0;
  const selfWidth = nodeContentWidth(node);
  const selfHeight = nodeContentHeight(node);

  if (!hasChildren) {
    return {
      name: node.name,
      path: node.path,
      annotation: node.annotation,
      isPageStack: node.isPageStack,
      components: node.components,
      x,
      y,
      width: selfWidth,
      height: selfHeight,
      children: [],
    };
  }

  // Layout children first to determine subtree width
  const childY = y + selfHeight + LEVEL_GAP;
  const layoutChildren: LayoutNode[] = [];
  let childX = x + SECTION_PADDING;

  for (let i = 0; i < node.children.length; i++) {
    if (i > 0) childX += SIBLING_GAP;
    const child = layoutSubtree(node.children[i], childX, childY);
    layoutChildren.push(child);
    childX = child.x + child.width;
  }

  // Compute bounding box for the section
  const childrenRight = layoutChildren.length > 0
    ? Math.max(...layoutChildren.map((c) => c.x + c.width))
    : x + selfWidth;
  const childrenBottom = layoutChildren.length > 0
    ? Math.max(...layoutChildren.map((c) => c.y + c.height))
    : childY;

  const sectionWidth = Math.max(
    selfWidth,
    childrenRight - x + SECTION_PADDING
  );
  const sectionHeight = childrenBottom - y + SECTION_PADDING;

  return {
    name: node.name,
    path: node.path,
    annotation: node.annotation,
    isPageStack: node.isPageStack,
    components: node.components,
    x,
    y,
    width: sectionWidth,
    height: sectionHeight,
    children: layoutChildren,
  };
}

function collectNodes(node: LayoutNode): LayoutNode[] {
  const result: LayoutNode[] = [node];
  for (const child of node.children) {
    result.push(...collectNodes(child));
  }
  return result;
}

function findLayoutNode(
  nodes: LayoutNode[],
  name: string
): LayoutNode | undefined {
  for (const node of nodes) {
    if (node.name === name) return node;
    const found = findLayoutNode(node.children, name);
    if (found) return found;
  }
  return undefined;
}

function collectEdges(
  iaNode: IANode,
  layoutNodes: LayoutNode[]
): LayoutEdge[] {
  const edges: LayoutEdge[] = [];
  const fromLayout = findLayoutNode(layoutNodes, iaNode.name);

  if (fromLayout) {
    for (const link of iaNode.links) {
      if (link.url) {
        edges.push({
          fromNode: iaNode.name,
          toNode: link.url,
          x1: fromLayout.x + fromLayout.width / 2,
          y1: fromLayout.y + fromLayout.height,
          x2: fromLayout.x + fromLayout.width / 2,
          y2: fromLayout.y + fromLayout.height + LEVEL_GAP,
          url: link.url,
        });
      } else {
        const toLayout = findLayoutNode(layoutNodes, link.target);
        if (toLayout) {
          edges.push({
            fromNode: iaNode.name,
            toNode: link.target,
            x1: fromLayout.x + fromLayout.width / 2,
            y1: fromLayout.y + fromLayout.height,
            x2: toLayout.x + toLayout.width / 2,
            y2: toLayout.y,
          });
        }
      }
    }
  }

  for (const child of iaNode.children) {
    edges.push(...collectEdges(child, layoutNodes));
  }

  return edges;
}

function collectAllNames(node: IANode): string[] {
  return [node.name, ...node.children.flatMap(collectAllNames)];
}

function collectAllLinks(node: IANode): { from: string; to: string }[] {
  const links: { from: string; to: string }[] = [];
  for (const link of node.links) {
    if (!link.url) {
      links.push({ from: node.name, to: link.target });
    }
  }
  for (const child of node.children) {
    links.push(...collectAllLinks(child));
  }
  return links;
}

function reorderToReduceCrossings(nodes: IANode[]): IANode[] {
  if (nodes.length <= 2) return nodes;

  // Collect all names contained within each top-level subtree
  const subtreeNames = new Map<string, Set<string>>();
  for (const node of nodes) {
    subtreeNames.set(node.name, new Set(collectAllNames(node)));
  }

  // Collect all cross-subtree links
  const allLinks = nodes.flatMap(collectAllLinks);
  const crossLinks: { from: string; to: string }[] = [];
  for (const link of allLinks) {
    const fromTree = nodes.find((n) => subtreeNames.get(n.name)!.has(link.from));
    const toTree = nodes.find((n) => subtreeNames.get(n.name)!.has(link.to));
    if (fromTree && toTree && fromTree !== toTree) {
      crossLinks.push({ from: fromTree.name, to: toTree.name });
    }
  }

  if (crossLinks.length === 0) return nodes;

  // Build adjacency weights between top-level nodes
  const weights = new Map<string, Map<string, number>>();
  for (const link of crossLinks) {
    if (!weights.has(link.from)) weights.set(link.from, new Map());
    if (!weights.has(link.to)) weights.set(link.to, new Map());
    weights.get(link.from)!.set(link.to, (weights.get(link.from)!.get(link.to) ?? 0) + 1);
    weights.get(link.to)!.set(link.from, (weights.get(link.to)!.get(link.from) ?? 0) + 1);
  }

  // Greedy placement: start with the node that has the most links,
  // then repeatedly place the most-connected unplaced neighbor next
  const placed: IANode[] = [];
  const remaining = new Set(nodes.map((n) => n.name));
  const nodeByName = new Map(nodes.map((n) => [n.name, n]));

  // Start with the node with the most cross-links
  let bestStart = nodes[0].name;
  let bestCount = 0;
  for (const [name, neighbors] of weights) {
    let total = 0;
    for (const count of neighbors.values()) total += count;
    if (total > bestCount) {
      bestCount = total;
      bestStart = name;
    }
  }

  placed.push(nodeByName.get(bestStart)!);
  remaining.delete(bestStart);

  while (remaining.size > 0) {
    // Find the unplaced node most connected to the last placed node
    const lastPlaced = placed[placed.length - 1].name;
    const neighbors = weights.get(lastPlaced);
    let bestNext: string | null = null;
    let bestWeight = 0;

    if (neighbors) {
      for (const [neighbor, weight] of neighbors) {
        if (remaining.has(neighbor) && weight > bestWeight) {
          bestWeight = weight;
          bestNext = neighbor;
        }
      }
    }

    if (bestNext) {
      placed.push(nodeByName.get(bestNext)!);
      remaining.delete(bestNext);
    } else {
      // No connected neighbor found — place the first remaining node
      const next = nodes.find((n) => remaining.has(n.name))!;
      placed.push(next);
      remaining.delete(next.name);
    }
  }

  return placed;
}

export function layout(diagram: IADiagram): Layout {
  const orderedNodes = reorderToReduceCrossings(diagram.nodes);
  const layoutNodes: LayoutNode[] = [];
  let x = 0;

  for (let i = 0; i < orderedNodes.length; i++) {
    if (i > 0) x += SIBLING_GAP;
    const node = layoutSubtree(orderedNodes[i], x, 0);
    layoutNodes.push(node);
    x = node.x + node.width;
  }

  const edges = collectEdges(
    { name: "__root__", isPageStack: false, children: diagram.nodes, links: [], components: [] },
    layoutNodes
  );

  const width = layoutNodes.length > 0
    ? Math.max(...layoutNodes.map((n) => n.x + n.width))
    : 0;
  const allNodes = layoutNodes.flatMap(collectNodes);
  const nodeMaxHeight = allNodes.length > 0
    ? Math.max(...allNodes.map((n) => n.y + n.height))
    : 0;
  const edgeMaxHeight = edges.length > 0
    ? Math.max(...edges.map((e) => e.y2 + (e.url ? LINE_HEIGHT : 0)))
    : 0;
  const height = Math.max(nodeMaxHeight, edgeMaxHeight);

  return {
    siteName: diagram.siteName,
    nodes: layoutNodes,
    edges,
    width,
    height,
  };
}
