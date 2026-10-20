/**
 * Terminal UI (TUI) & Styling Engine for Soma Labs
 *
 * Provides:
 *   1. 24-bit TrueColor palettes and text stylers.
 *   2. Pill badges for execution outcomes (PASS, REFUSED, COLLAPSE, GATE).
 *   3. Unicode rounded cards, boxes, and tree connectors.
 *   4. TypeScript syntax highlighting in terminal output.
 *   5. Dataflow pipeline ASCII diagrams.
 *   6. Half-block pixel rendering for terminal icons and graphics.
 *   7. Graceful degradation: auto-detects TTY, respects NO_COLOR and FORCE_COLOR.
 */

export function isColorSupported(): boolean {
  if (typeof Deno !== "undefined") {
    if (Deno.env.get("NO_COLOR")) return false;
    if (Deno.env.get("FORCE_COLOR") === "1") return true;
    try {
      return Deno.stdout.isTerminal();
    } catch {
      return true;
    }
  }
  if (typeof process !== "undefined") {
    if (process.env.NO_COLOR) return false;
    if (process.env.FORCE_COLOR === "1") return true;
    return Boolean(process.stdout?.isTTY);
  }
  return true;
}

const ESC = "\x1b";
const RESET_CODE = `${ESC}[0m`;
const BOLD_CODE = `${ESC}[1m`;
const DIM_CODE = `${ESC}[2m`;
const ITALIC_CODE = `${ESC}[3m`;
const UNDERLINE_CODE = `${ESC}[4m`;

export function fg(r: number, g: number, b: number, text: string): string {
  if (!isColorSupported()) return text;
  return `${ESC}[38;2;${r};${g};${b}m${text}${RESET_CODE}`;
}

export function bg(r: number, g: number, b: number, text: string): string {
  if (!isColorSupported()) return text;
  return `${ESC}[48;2;${r};${g};${b}m${text}${RESET_CODE}`;
}

// Editorial Dark Palette
export const theme = {
  // Foreground Colors
  cyan: (s: string) => fg(56, 189, 248, s),
  green: (s: string) => fg(74, 222, 128, s),
  emerald: (s: string) => fg(52, 211, 153, s),
  amber: (s: string) => fg(251, 191, 36, s),
  purple: (s: string) => fg(192, 132, 252, s),
  pink: (s: string) => fg(244, 114, 182, s),
  rose: (s: string) => fg(251, 113, 133, s),
  slate: (s: string) => fg(148, 163, 184, s),
  darkSlate: (s: string) => fg(100, 116, 139, s),
  white: (s: string) => fg(255, 255, 255, s),
  gray: (s: string) => fg(156, 163, 175, s),

  // Modifiers
  bold: (s: string) => (isColorSupported() ? `${BOLD_CODE}${s}${RESET_CODE}` : s),
  dim: (s: string) => (isColorSupported() ? `${DIM_CODE}${s}${RESET_CODE}` : s),
  italic: (s: string) => (isColorSupported() ? `${ITALIC_CODE}${s}${RESET_CODE}` : s),
  underline: (s: string) => (isColorSupported() ? `${UNDERLINE_CODE}${s}${RESET_CODE}` : s),
  reset: () => (isColorSupported() ? RESET_CODE : ""),
};

export type BadgeVariant =
  | "pass"
  | "fail"
  | "refused"
  | "warning"
  | "info"
  | "accent"
  | "collapse"
  | "trap"
  | "neutral";

export function badge(text: string, variant: BadgeVariant = "info"): string {
  if (!isColorSupported()) return `[${text}]`;

  const config: Record<BadgeVariant, { fg: [number, number, number]; bg: [number, number, number] }> = {
    pass: { fg: [255, 255, 255], bg: [22, 101, 52] },      // Emerald green pill
    fail: { fg: [255, 255, 255], bg: [153, 27, 27] },      // Dark red pill
    refused: { fg: [255, 255, 255], bg: [136, 19, 55] },   // Rose/crimson pill
    warning: { fg: [255, 255, 255], bg: [120, 53, 15] },   // Amber pill
    collapse: { fg: [255, 255, 255], bg: [180, 83, 9] },   // Deep amber pill
    trap: { fg: [255, 255, 255], bg: [162, 28, 175] },     // Fuchsia pill
    info: { fg: [255, 255, 255], bg: [12, 74, 110] },      // Sky blue pill
    accent: { fg: [255, 255, 255], bg: [88, 28, 135] },    // Purple pill
    neutral: { fg: [226, 232, 240], bg: [51, 65, 85] },    // Slate pill
  };

  const { fg: f, bg: b } = config[variant];
  return `${ESC}[48;2;${b[0]};${b[1]};${b[2]}m${ESC}[38;2;${f[0]};${f[1]};${f[2]}m${BOLD_CODE} ${text} ${RESET_CODE}`;
}

export function highlightTs(code: string): string {
  if (!isColorSupported()) return code;

  // Simple, deterministic regex-based tokenizer for TypeScript snippets
  return code
    // Strings
    .replace(/(["'`].*?["'`])/g, (m) => theme.green(m))
    // Keywords
    .replace(
      /\b(function|return|const|let|var|type|interface|class|export|import|from|extends|keyof|typeof|as|never|void|switch|case|default|if|else|throw|new)\b/g,
      (m) => theme.purple(m),
    )
    // Primitive types
    .replace(/\b(string|number|boolean|unknown|any|null|undefined|Record|Promise|Array|Map|Set)\b/g, (m) =>
      theme.cyan(m),
    )
    // Common Type parameters
    .replace(/\b([TKRUPS])\b(?=\s*[,>:=])/g, (m) => theme.amber(m))
    // Numbers
    .replace(/\b(\d+)\b/g, (m) => theme.amber(m));
}

export function card(title: string, lines: string[], options: { width?: number; borderColor?: (s: string) => string } = {}): string {
  const width = options.width ?? 78;
  const color = options.borderColor ?? theme.cyan;
  const titleText = ` ${title} `;
  const topDashCount = Math.max(0, width - 4 - titleText.length);

  const top = color(`╭──${theme.bold(titleText)}${"─".repeat(topDashCount)}╮`);
  const bottom = color(`╰${"─".repeat(width - 2)}╯`);
  const borderChar = color("│");

  const formattedLines = lines.map((line) => `${borderChar}  ${line}`);
  return `${top}\n${formattedLines.join("\n")}\n${bottom}`;
}

export function treeStep(label: string, value: string, isLast = false): string {
  const branch = isLast ? "╰─" : "├─";
  return `${theme.darkSlate(branch)} ${theme.slate(label)}: ${value}`;
}

export function dataFlowPipeline(stages: { label: string; sub?: string }[]): string {
  const boxTop = "┌" + "─".repeat(18) + "┐";
  const boxBottom = "└" + "─".repeat(18) + "┘";
  const arrow = theme.amber(" ──► ");

  const stageBoxes = stages.map((s) => {
    const label = s.label.padEnd(16, " ").slice(0, 16);
    return {
      top: theme.darkSlate(boxTop),
      mid: `${theme.darkSlate("│")} ${theme.cyan(label)} ${theme.darkSlate("│")}`,
      bot: theme.darkSlate(boxBottom),
      sub: (s.sub ?? "").padStart(18, " ").slice(0, 18),
    };
  });

  const row1 = stageBoxes.map((b) => b.top).join("     ");
  const row2 = stageBoxes.map((b, i) => b.mid + (i < stageBoxes.length - 1 ? arrow : "")).join("");
  const row3 = stageBoxes.map((b) => b.bot).join("     ");
  const row4 = stageBoxes.map((b) => theme.dim(b.sub)).join("     ");

  return `${row1}\n${row2}\n${row3}\n${row4}`;
}

export function drawGradientCanvas(width = 36, height = 6): string {
  if (!isColorSupported()) return "";

  let out = "";
  for (let y = 0; y < height; y += 2) {
    out += "    ";
    for (let x = 0; x < width; x++) {
      const r1 = Math.floor((x / width) * 180 + 40);
      const g1 = Math.floor((y / height) * 120 + 70);
      const b1 = Math.floor(255 - (x / width) * 140);

      const r2 = Math.floor((x / width) * 180 + 40);
      const g2 = Math.floor(((y + 1) / height) * 120 + 70);
      const b2 = Math.floor(255 - (x / width) * 140);

      out += `${ESC}[48;2;${r1};${g1};${b1}m${ESC}[38;2;${r2};${g2};${b2}m▄${RESET_CODE}`;
    }
    out += "\n";
  }
  return out;
}
