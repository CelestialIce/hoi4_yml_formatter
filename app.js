const rawInput = document.getElementById("raw-input");
const yamlOutput = document.getElementById("yaml-output");
const previewList = document.getElementById("preview-list");
const copyButton = document.getElementById("copy-button");
const formatButton = document.getElementById("format-button");
const clearButton = document.getElementById("clear-button");

const patterns = [
  /^(?<key>[^:#\s][^:#]*?)\s*:\s*"(?<value>.*)"(?:\s*#.*)?$/,
  /^(?<key>[^:#\s][^:#]*?)\s*:\s*(?<id>\d+)\s*"(?<value>.*)"(?:\s*#.*)?$/
];

function parseInput(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  const errors = [];
  let rootKey = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    if (/^[^"#]+:\s*$/.test(trimmed)) {
      rootKey = trimmed.replace(/:\s*$/, "");
      return;
    }

    if (!trimmed.includes(":")) {
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
      errors.push({
        line: index + 1,
        content: trimmed
      });
      return;
    }

    const rawValue = match.value;
    const displayValue = decodeValue(rawValue);

    entries.push({
      key: match.key.trim(),
      value: displayValue,
      rawValue
    });
  });

  return { rootKey, entries, errors };
}

function decodeValue(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/""/g, '"');
}

function escapeYaml(value) {
  return value
    .replace(/"/g, '\\"');
}

function buildYaml({ rootKey, entries }) {
  const lines = [];
  if (rootKey) {
    lines.push(`${rootKey}:`);
  }

  const indent = rootKey ? "  " : "";

  entries.forEach((entry) => {
    if (!entry.value.length) {
      lines.push(`${indent}${entry.key}: ""`);
      return;
    }

    if (entry.value.includes("\n")) {
      lines.push(`${indent}${entry.key}: |-`);
      const subIndent = `${indent}  `;
      entry.value.split(/\n/).forEach((line) => {
        lines.push(`${subIndent}${line}`);
      });
    } else {
      lines.push(`${indent}${entry.key}: "${escapeYaml(entry.value)}"`);
    }
  });

  return lines.join("\n");
}

function renderPreview(entries, errors) {
  previewList.innerHTML = "";

  if (errors.length) {
    const errorBanner = document.createElement("div");
    errorBanner.className = "error-banner";
    errorBanner.textContent = `Skipped ${errors.length} line(s). Check formatting near: ${errors[0].content}`;
    previewList.appendChild(errorBanner);
  }

  if (!entries.length && !errors.length) {\n    return;\n  }

  entries.forEach(({ key, value }) => {
    const container = document.createElement("div");
    container.className = "entry";

    const keyLabel = document.createElement("div");
    keyLabel.className = "key";
    keyLabel.textContent = key;

    const valueBlock = document.createElement("pre");
    valueBlock.className = "value";
    valueBlock.textContent = value || "";

    container.appendChild(keyLabel);
    container.appendChild(valueBlock);
    previewList.appendChild(container);
  });
}

function process() {
  const { rootKey, entries, errors } = parseInput(rawInput.value);
  const yamlString = entries.length ? buildYaml({ rootKey, entries }) : "";
  yamlOutput.textContent = yamlString;
  renderPreview(entries, errors);
}

copyButton.addEventListener("click", () => {
  if (!yamlOutput.textContent.trim()) {
    return;
  }
  navigator.clipboard.writeText(yamlOutput.textContent).then(() => {
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy YAML";
    }, 1500);
  });
});

formatButton.addEventListener("click", process);
clearButton.addEventListener("click", () => {
  rawInput.value = "";
  yamlOutput.textContent = "";
  renderPreview([], []);
  rawInput.focus();
});

rawInput.addEventListener("input", process);
rawInput.addEventListener("paste", () => {
  setTimeout(process, 0);
});

if (!rawInput.value.trim()) {
  rawInput.value = sampleText;
  process();
}



