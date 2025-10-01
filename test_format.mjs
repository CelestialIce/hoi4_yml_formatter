import { readFileSync } from "node:fs";

const text = readFileSync("test_sample_input.txt", "utf8");

const patterns = [
  /^(?<key>[^:#\s][^:#]*?)\s*:\s*"(?<value>.*)"(?:\s*#.*)?$/,
  /^(?<key>[^:#\s][^:#]*?)\s*:\s*(?<id>\d+)\s*"(?<value>.*)"(?:\s*#.*)?$/
];

function parseInput(input) {
  const lines = input.split(/\r?\n/);
  const entries = [];
  const errors = [];
  let rootKey = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (!trimmed.includes(":")) return;
    if (trimmed.startsWith("#")) return;

    if (/^[^"#]+:\s*$/.test(trimmed)) {
      rootKey = trimmed.replace(/:\s*$/, "");
      return;
    }

    let match = null;
    for (const pattern of patterns) {
      const result = trimmed.match(pattern);
      if (result) {
        match = result.groups;
        break;
      }
    }

    if (!match) {
      errors.push({ line: index + 1, content: trimmed });
      return;
    }

    const rawValue = match.value;
    const value = rawValue
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/""/g, '"');

    entries.push({ key: match.key.trim(), value });
  });

  return { rootKey, entries, errors };
}

function escapeYaml(value) {
  return value.replace(/"/g, '\\"');
}

function buildYaml({ rootKey, entries }) {
  const lines = [];
  if (rootKey) {
    lines.push(`${rootKey}:`);
  }
  const indent = rootKey ? "  " : "";
  for (const entry of entries) {
    if (!entry.value.length) {
      lines.push(`${indent}${entry.key}: ""`);
      continue;
    }
    if (entry.value.includes("\n")) {
      lines.push(`${indent}${entry.key}: |-`);
      const subIndent = indent + "  ";
      entry.value.split(/\n/).forEach((line) => {
        lines.push(`${subIndent}${line}`);
      });
    } else {
      lines.push(`${indent}${entry.key}: "${escapeYaml(entry.value)}"`);
    }
  }
  return lines.join("\n");
}

const result = parseInput(text);
console.log({
  rootKey: result.rootKey,
  entries: result.entries.length,
  errors: result.errors
});
console.log("--- formatted ---\n" + buildYaml(result));
