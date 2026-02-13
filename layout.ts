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

  for (const child of iaNode.children) {
    edges.push(...collectEdges(child, layoutNodes));
  }

  return edges;
}

export function layout(diagram: IADiagram): Layout {
  const layoutNodes: LayoutNode[] = [];
  let x = 0;

  for (let i = 0; i < diagram.nodes.length; i++) {
    if (i > 0) x += SIBLING_GAP;
    const node = layoutSubtree(diagram.nodes[i], x, 0);
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
  const height = allNodes.length > 0
    ? Math.max(...allNodes.map((n) => n.y + n.height))
    : 0;

  return {
    siteName: diagram.siteName,
    nodes: layoutNodes,
    edges,
    width,
    height,
  };
}
