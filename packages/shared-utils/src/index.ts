export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

export function generateUUID(): string {
  return Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * highlightTS
 * A regex-based static syntax highlighter for TypeScript snippets.
 * Converts keywords, enums, strings, and comments into CSS-styled spans.
 */
export function highlightTS(code: string): string {
  // Escape HTML characters
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Save comments to restore later (avoids styling keywords inside comments)
  const comments: string[] = [];
  html = html.replace(/(\/\/.*)/g, (match) => {
    comments.push(match);
    return `__COMMENT_PLACEHOLDER_${comments.length - 1}__`;
  });

  // Save strings to restore later
  const strings: string[] = [];
  html = html.replace(/(["'`])(.*?)\1/g, (match) => {
    strings.push(match);
    return `__STRING_PLACEHOLDER_${strings.length - 1}__`;
  });

  // Highlight Keywords
  const keywords = [
    "class", "interface", "implements", "public", "private", "readonly",
    "constructor", "return", "const", "let", "if", "else", "throw", "new",
    "void", "null", "boolean", "string", "number", "true", "false", "extends"
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  html = html.replace(keywordRegex, '<span style="color: #ec4899; font-weight: bold;">$1</span>');

  // Highlight Classes/Types (CamelCase starting with uppercase)
  html = html.replace(
    /\b(?!__COMMENT_PLACEHOLDER_|__STRING_PLACEHOLDER_)([A-Z][a-zA-Z0-9_]+)\b/g,
    '<span style="color: #38bdf8;">$1</span>'
  );

  // Restore Strings (styled as amber)
  html = html.replace(/__STRING_PLACEHOLDER_(\d+)__/g, (_, idx) => {
    return `<span style="color: #eab308;">${strings[Number(idx)]}</span>`;
  });

  // Restore Comments (styled as muted slate-grey italic)
  html = html.replace(/__COMMENT_PLACEHOLDER_(\d+)__/g, (_, idx) => {
    return `<span style="color: #64748b; font-style: italic;">${comments[Number(idx)]}</span>`;
  });

  return html;
}
