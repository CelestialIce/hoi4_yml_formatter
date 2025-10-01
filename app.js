const rawInput = document.getElementById("raw-input");
const yamlOutput = document.getElementById("yaml-output");
const previewList = document.getElementById("preview-list");
const copyButton = document.getElementById("copy-button");
const formatButton = document.getElementById("format-button");
const clearButton = document.getElementById("clear-button");

const sampleText = `l_english:

Chen_Cheng_DESC: "Graduating from Baoding Military Academy in 1922, Chen Cheng entered Whampoa Military Academy two years later, meeting Chiang Kai-shek for the first time, then Commandant of the Academy. Later on, Chen joined National Revolutionary Army, which he climbed up the rank structure with flying colours. His successes allowed him to be promoted time and time again, eventually becoming the commander of the 18th Army.\n\nAfter the end of the Second Chinese Civil War, Chen Cheng's close ties with Chiang Kai-shek and his influence within the military landed Chen a favourable position as the Overseer of the Dongbei Authority, a department overseeing the reconstruction and development of Northeast China prior to his appointment as Premier of the Executive Yuan.\n\nAs Premier, Chen Cheng stayed as Chiang Kai-shek's capable "right-hand man", overseeing many national projects, such as his famous land reforms."
Chiang_Kai_Shek_desc: "Incumbent President of the Republic of China, Former Generalissimo of the Republic of China, Director-General of the Kuomintang. Chiang Kai-shek has led China through her many recent crises. After emerging victorious in both the War of Resistance Against the Japanese and the Chinese Civil War, the position of Nationalist leadership was firmly secured.\n\nFollowing this, the traditional warlords submitted to Nanjing and accepted their new life as politicians. In addition, the end of these threats and pressure from the Americans meant that the Kuomintang no longer has any excuse to prolong the so-called "Dang-Guo" authoritarian rule."`;

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

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.textContent = "No entries detected yet.";
    previewList.appendChild(empty);
    return;
  }

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
