import type { Layout, LayoutNode, LayoutEdge } from "./layout";
import type { Theme } from "./theme";
import { defaultTheme } from "./theme";

const SVG_PADDING = 20;
const STACK_OFFSET = 6;
const CORNER_RADIUS = 6;
const FONT_SIZE = 13;
const SMALL_FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const NODE_PADDING_Y = 10;
const NODE_PADDING_X = 12;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRect(
  x: number,
  y: number,
  width: number,
  height: number,
  opts: { fill?: string; stroke?: string; rx?: number; dasharray?: string } = {}
): string {
  const fill = opts.fill ?? "#fff";
  const stroke = opts.stroke ?? "#333";
  const rx = opts.rx ?? CORNER_RADIUS;
  const dash = opts.dasharray ? ` stroke-dasharray="${opts.dasharray}"` : "";
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"${dash}/>`;
}

function renderLeafNode(node: LayoutNode, theme: Theme): string {
  const parts: string[] = [];

  if (node.isPageStack) {
    parts.push(
      renderRect(
        node.x + STACK_OFFSET * 2,
        node.y + STACK_OFFSET * 2,
        node.width,
        node.height,
        { fill: theme.stackBackFill, stroke: theme.nodeStroke }
      )
    );
    parts.push(
      renderRect(
        node.x + STACK_OFFSET,
        node.y + STACK_OFFSET,
        node.width,
        node.height,
        { fill: theme.stackMidFill, stroke: theme.nodeStroke }
      )
    );
  }

  parts.push(renderRect(node.x, node.y, node.width, node.height, {
    fill: theme.nodeFill,
    stroke: theme.nodeStroke,
  }));

  let textY = node.y + NODE_PADDING_Y + FONT_SIZE;
  parts.push(
    `<text x="${node.x + NODE_PADDING_X}" y="${textY}" font-family="sans-serif" font-size="${FONT_SIZE}" font-weight="bold" fill="${theme.nameText}">${escapeXml(node.name)}</text>`
  );

  if (node.path) {
    textY += LINE_HEIGHT;
    parts.push(
      `<text x="${node.x + NODE_PADDING_X}" y="${textY}" font-family="sans-serif" font-size="${SMALL_FONT_SIZE}" fill="${theme.pathText}">${escapeXml(node.path)}</text>`
    );
  }

  if (node.annotation) {
    textY += LINE_HEIGHT;
    parts.push(
      `<text x="${node.x + NODE_PADDING_X}" y="${textY}" font-family="sans-serif" font-size="${SMALL_FONT_SIZE}" fill="${theme.annotationText}" font-style="italic">${escapeXml(node.annotation)}</text>`
    );
  }

  for (const comp of node.components) {
    textY += LINE_HEIGHT;
    parts.push(
      `<text x="${node.x + NODE_PADDING_X}" y="${textY}" font-family="sans-serif" font-size="${SMALL_FONT_SIZE}" fill="${theme.componentText}">[${escapeXml(comp)}]</text>`
    );
  }

  return parts.join("\n");
}

function renderSectionNode(node: LayoutNode, theme: Theme): string {
  const parts: string[] = [];

  parts.push(
    renderRect(node.x, node.y, node.width, node.height, {
      fill: theme.sectionFill,
      stroke: theme.sectionStroke,
      dasharray: "4 2",
    })
  );

  parts.push(
    `<text x="${node.x + NODE_PADDING_X}" y="${node.y + NODE_PADDING_Y + FONT_SIZE}" font-family="sans-serif" font-size="${FONT_SIZE}" font-weight="bold" fill="${theme.nameText}">${escapeXml(node.name)}</text>`
  );

  if (node.path) {
    parts.push(
      `<text x="${node.x + NODE_PADDING_X}" y="${node.y + NODE_PADDING_Y + FONT_SIZE + LINE_HEIGHT}" font-family="sans-serif" font-size="${SMALL_FONT_SIZE}" fill="${theme.pathText}">${escapeXml(node.path)}</text>`
    );
  }

  for (const child of node.children) {
    parts.push(renderNode(child, theme));
  }

  return parts.join("\n");
}

function renderNode(node: LayoutNode, theme: Theme): string {
  if (node.children.length > 0) {
    return renderSectionNode(node, theme);
  }
  return renderLeafNode(node, theme);
}

function renderEdge(edge: LayoutEdge, theme: Theme): string {
  const dy = edge.y2 - edge.y1;
  const offset = Math.min(Math.abs(dy) * 0.5, 40);
  const cp1x = edge.x1;
  const cp1y = edge.y1 + offset;
  const cp2x = edge.x2;
  const cp2y = edge.y2 - offset;

  if (edge.url) {
    const parts: string[] = [];
    parts.push(
      `<path d="M ${edge.x1} ${edge.y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${edge.x2} ${edge.y2}" stroke="${theme.edgeStroke}" stroke-width="1.5" stroke-dasharray="6 3" fill="none" marker-end="url(#arrowhead)"/>`
    );
    parts.push(
      `<text x="${edge.x2}" y="${edge.y2 + LINE_HEIGHT}" font-family="sans-serif" font-size="${SMALL_FONT_SIZE}" fill="${theme.edgeStroke}" text-anchor="middle">${escapeXml(edge.url)}</text>`
    );
    return parts.join("\n");
  }

  return `<path d="M ${edge.x1} ${edge.y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${edge.x2} ${edge.y2}" stroke="${theme.edgeStroke}" stroke-width="1.5" fill="none" marker-end="url(#arrowhead)"/>`;
}

export function render(layoutResult: Layout, theme: Theme = defaultTheme): string {
  const width = layoutResult.width + SVG_PADDING * 2;
  const height = layoutResult.height + SVG_PADDING * 2;

  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`
  );
  parts.push(`<defs>`);
  parts.push(
    `<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${theme.edgeStroke}"/></marker>`
  );
  parts.push(`</defs>`);
  parts.push(`<g transform="translate(${SVG_PADDING}, ${SVG_PADDING})">`);

  for (const node of layoutResult.nodes) {
    parts.push(renderNode(node, theme));
  }

  for (const edge of layoutResult.edges) {
    parts.push(renderEdge(edge, theme));
  }

  parts.push(`</g>`);
  parts.push(`</svg>`);

  return parts.join("\n");
}
