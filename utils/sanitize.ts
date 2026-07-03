const SQL_LIKE_PATTERN =
  /(--|;|\/\*|\*\/|\b(select|insert|update|delete|drop|alter|truncate|union|exec)\b)/i;

const CONTROL_CHAR_PATTERN = /[\u0000-\u001f\u007f]/g;

const HTML_MARKER_PATTERN = /[<>]/;

const SHEET_FORMULA_PATTERN = /^[=+\-@\t\r]/;

export function normalizeWhitespace(value: string): string {
  return value
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeText(value: string, maxLength: number): string {
  return normalizeWhitespace(value).slice(0, maxLength);
}

export function containsHtml(value: string): boolean {
  return HTML_MARKER_PATTERN.test(value);
}

export function containsSqlLikeInput(value: string): boolean {
  return SQL_LIKE_PATTERN.test(value);
}

export function escapeSheetFormula(value: string): string {
  return SHEET_FORMULA_PATTERN.test(value) ? `'${value}` : value;
}