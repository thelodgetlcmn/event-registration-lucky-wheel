import type { ImportRegistrant, Registrant } from "@/types/registration";

import { escapeHtml, normalizeWhitespace } from "@/utils/sanitize";

const FIRST_NAME_KEYS = ["first name", "firstname", "ชื่อ", "name"];
const LAST_NAME_KEYS = ["last name", "lastname", "นามสกุล", "surname"];
const NICKNAME_KEYS = ["nickname", "nick name", "ชื่อเล่น"];
const PHONE_KEYS = ["phone", "โทรศัพท์", "เบอร์โทร", "เบอร์"];
const EMAIL_KEYS = ["email", "อีเมล"];

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows.filter((candidate) =>
    candidate.some((value) => normalizeWhitespace(value).length > 0),
  );
}

export function csvToImportRegistrants(text: string): ImportRegistrant[] {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => normalizeWhitespace(header).toLowerCase());
  const firstNameIndex = findHeader(headers, FIRST_NAME_KEYS);
  const lastNameIndex = findHeader(headers, LAST_NAME_KEYS);
  const nicknameIndex = findHeader(headers, NICKNAME_KEYS);
  const phoneIndex = findHeader(headers, PHONE_KEYS);
  const emailIndex = findHeader(headers, EMAIL_KEYS);

  if (  firstNameIndex < 0 ||
        lastNameIndex < 0 ||
        nicknameIndex < 0 ||
        phoneIndex < 0 ||
        emailIndex < 0
      ) {
    throw new Error("CSV ต้องมีคอลัมน์ First Name และ Last Name");
  }

  return rows.slice(1).map((row) => ({
    firstName: normalizeWhitespace(row[firstNameIndex] ?? ""),
    lastName: normalizeWhitespace(row[lastNameIndex] ?? ""),
    nickname: normalizeWhitespace(row[nicknameIndex] ?? ""),
    phone: normalizeWhitespace(row[phoneIndex] ?? ""),
    email: normalizeWhitespace(row[emailIndex] ?? ""),
  }));
}

export function registrantsToCsv(registrants: Registrant[]): string {
  const header = ["Timestamp", "First Name", "Last Name","Nickname","Phone","Email", "UUID", "Status", "Winner"];
  const rows = registrants.map((registrant) => [
    registrant.timestamp,
    registrant.firstName,
    registrant.lastName,
    registrant.nickname,
    registrant.phone,
    registrant.email,
    registrant.uuid,
    registrant.status,
    registrant.winner ? "TRUE" : "FALSE",
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function findHeader(headers: string[], candidates: string[]): number {
  return headers.findIndex((header) => candidates.includes(header));
}

function escapeCsvCell(value: string): string {
  const safeValue = escapeHtml(value);
  if (/[",\n\r]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}
