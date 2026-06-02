import { remark } from "remark";

type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  children?: MdNode[];
};

type HeadingNode = MdNode & { depth: number; children: MdNode[] };

const HEADING_PREFIX_PATTERNS: RegExp[] = [
  /^\s*\d+(?:\.\d+)*(?:[.、:：)）\]】])\s*/u,
  /^\s*\d+(?:\.\d+)*\s+/u,
  /^\s*[（(][A-Za-z0-9]{1,6}[)）](?:[.、:：])?\s*/u,
  /^\s*[A-Za-z]{1,4}(?:[.、:：)）\]】])\s*/u,
  /^\s*[一二三四五六七八九十百千万零〇两]{1,8}(?:[.、:：)）\]】])\s*/u
];

function getHeadingPrefixLength(input: string): number {
  let remaining = input;
  let consumed = 0;

  while (remaining.length > 0) {
    let matchedLength = 0;

    for (const pattern of HEADING_PREFIX_PATTERNS) {
      const matched = remaining.match(pattern);
      if (matched && matched[0].length > 0) {
        matchedLength = matched[0].length;
        break;
      }
    }

    if (matchedLength === 0) {
      break;
    }

    consumed += matchedLength;
    remaining = remaining.slice(matchedLength);
  }

  return consumed;
}

function* walk(node: MdNode): Generator<MdNode> {
  yield node;
  if (!node.children) {
    return;
  }
  for (const child of node.children) {
    yield* walk(child);
  }
}

function isHeadingNode(node: MdNode): node is HeadingNode {
  return node.type === "heading" && !!node.children;
}

function _stripHeadingNumbers() {
  return function (tree: MdNode) {
    for (const node of walk(tree)) {
      if (node.type !== "heading" || !node.children) {
        continue;
      }
      for (const child of node.children) {
        if (child.type === "text" && typeof child.value === "string") {
          const removeLength = getHeadingPrefixLength(child.value);
          if (removeLength > 0) {
            child.value = child.value.slice(removeLength);
          }
          break;
        }
      }
    }
  };
}

function _shiftHeadingLevel(offset: number) {
  return function (tree: MdNode) {
    for (const node of walk(tree)) {
      if (isHeadingNode(node)) {
        node.depth = Math.min(Math.max(node.depth + offset, 1), 6);
      }
    }
  }
}

export function stripHeadingNumbers(markdown: string): string {
  const file = remark().use(_stripHeadingNumbers).processSync(markdown);
  return String(file);
}

/**
 * apply a level offset to all headings
 * 
 * e.g. `## First Heading`
 * 
 * offset = 1 -> `# First Heading` level up
 * 
 * offset = -1 -> `### First Heading` level down
 * 
 * @param markdown 
 * @param offset 
 * @returns processed markdown string
 */
export function shiftHeadingLevel(markdown: string, offset: number): string {
  const file = remark().use(_shiftHeadingLevel, offset).processSync(markdown);
  return String(file);
}