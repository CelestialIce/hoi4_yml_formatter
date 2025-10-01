# HOI4 Localisation YAML Formatter

> 玩游戏实在是没有时间，只能加载文本看看解解馋。

A tiny, zero‑dependency web tool to take Hearts of Iron IV (Paradox) localisation lines and turn them into readable, properly formatted YAML while rendering the in‑game text with real newlines for preview.

The left editor accepts raw localisation lines (e.g. `key: "value"` with `\n` and quotes). The right side shows:

- A copyable YAML block using `|-` for multi‑line values
- A live preview that renders `\n` as real line breaks

## Features

- Parses HOI4/Paradox localisation lines: `key: "value"` and `key:0 "value"`
- Renders `\n` as line breaks in the preview list
- Handles embedded quotes inside values (escaped `\"` and doubled `""`)
- Ignores trailing `# comments` on a line
- Converts multi‑line values to YAML block scalars (`|-`) for readability
- Copy button to place the YAML text on your clipboard
- Works entirely offline—just open `index.html`

## Why

When you only have time to skim content outside the game, it helps to paste localisation lines and read them as clean paragraphs instead of `\n` escape sequences.

## Usage

- Open `formatter/index.html` in any modern browser
- Paste your localisation text into the left box
- Click `Format` (or just paste) to update the preview
- Click `Copy YAML` to copy the formatted YAML block

## Input Format Tips

- Each entry should be on a single line: `key: "..."`
- `\n` will be turned into real line breaks in the preview
- Lines starting with `#` are ignored (comments)
- Lines with an integer token like `key:0 "..."` are supported
- Trailing comments after the value are allowed: `key: "..." # note`

## Common Parse Warnings

If a red banner says lines were skipped, it usually means one of the following:

- Missing closing quote at the end of a long text entry
- A line that isn’t `key: "value"` (no colon or value)
- Rarely, a line that spans multiple physical lines in the source file

Fix the source line (e.g. add the closing quote) and re‑paste.

## Dev Notes

- No build step; everything is plain HTML/CSS/JS
- Main files live in `formatter/`:
  - `index.html` – layout and controls
  - `styles.css` – light UI to match the input pane
  - `app.js` – parser, YAML builder, and preview renderer
  - `test_format.mjs` – quick Node sanity check

---

If you want this published on GitHub, create a new repo and push the `formatter/` folder (or the whole project). Sample steps:

```
# from the project root
git init
git add formatter localisation .gitignore README.md
git commit -m "Add HOI4 localisation YAML formatter"
# then create a repo on GitHub and run:
# git remote add origin https://github.com/<you>/<repo>.git
# git branch -M main
# git push -u origin main
```

