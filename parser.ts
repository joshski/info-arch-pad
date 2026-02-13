import peggy from "peggy";
import type { IADiagram } from "./model";

const grammarSource = `
{{
  function buildTree(siteDecl, lines) {
    const root = { siteName: siteDecl, nodes: [] };
    if (!lines || lines.length === 0) return root;

    const stack = [{ indent: -1, node: root }];

    for (const line of lines) {
      if (!line) continue;
      const { indent, entry } = line;

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;

      if (entry.type === 'node') {
        const node = entry.value;
        if (parent === root) {
          root.nodes.push(node);
        } else {
          parent.children.push(node);
        }
        stack.push({ indent, node });
      } else if (entry.type === 'link') {
        if (parent !== root) {
          parent.links.push(entry.value);
        }
      } else if (entry.type === 'component') {
        if (parent !== root) {
          parent.components.push(entry.value);
        }
      }
    }

    return root;
  }
}}

diagram = blankLines siteDecl:siteLine lines:bodyLine* { return buildTree(siteDecl, lines); }

siteLine = "site" _ name:identifier trailingWs NL { return name; }

bodyLine = blankLine { return null; } / indentedLine

blankLine = trailingWs "\\n" { return null; }

blankLines = blankLine*

indentedLine = indent:indent entry:lineEntry trailingWs NL {
  return { indent, entry };
}

indent = spaces:$" "+ { return spaces.length; }

lineEntry = externalLink / link / component / node

node = name:identifier path:(_ p:path { return p; })? annotation:(_ a:annotation { return a; })? {
  const hasParam = path ? /:/.test(path) : false;
  return {
    type: 'node',
    value: {
      name,
      path: path || undefined,
      annotation: annotation || undefined,
      isPageStack: hasParam,
      children: [],
      links: [],
      components: [],
    }
  };
}

externalLink = "--->" _ url:url {
  return { type: 'link', value: { target: url, url } };
}

link = "-->" _ target:identifier {
  return { type: 'link', value: { target } };
}

url = $("http" "s"? "://" [^ \\t\\n]+)

component = "[" name:$[^\\]]+ "]" {
  return { type: 'component', value: name.trim() };
}

path = $("/" [a-zA-Z0-9_/:.-]*)

annotation = "(" text:$[^)]+ ")" { return text.trim(); }

identifier = $[a-zA-Z0-9_-]+

_ = [ \\t]*

trailingWs = [ \\t]*

NL = "\\n" / !.
`;

const parser = peggy.generate(grammarSource);

export function parse(input: string): IADiagram {
  // Ensure input ends with a newline for the grammar
  const normalized = input.endsWith("\n") ? input : input + "\n";
  return parser.parse(normalized) as IADiagram;
}
