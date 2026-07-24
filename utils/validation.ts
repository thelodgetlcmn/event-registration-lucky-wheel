import { z } from "zod";

import {
  containsHtml,
  containsSqlLikeInput,
  normalizeWhitespace,
  sanitizeText,
} from "@/utils/sanitize";

const MAX_NAME_LENGTH = 60;
const MAX_PHONE_LENGTH = 20;
const MAX_EMAIL_LENGTH = 120;

const NAME_PATTERN = /^[\p{L}\p{M}\s.'-]+$/u;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* ---------------- NAME ---------------- */
function nameField(label: string) {
  return z
    .string()
    .transform((v) => normalizeWhitespace(v))
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({ code: "custom", message: `กรุณากรอก${label}` });
      }

      if (value.length > MAX_NAME_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: `${label}ต้องไม่เกิน ${MAX_NAME_LENGTH} ตัวอักษร`,
        });
      }

      if (containsHtml(value)) {
        ctx.addIssue({
          code: "custom",
          message: `${label}ห้ามมี HTML หรือ script`,
        });
      }

      if (containsSqlLikeInput(value)) {
        ctx.addIssue({
          code: "custom",
          message: `${label}มีรูปแบบที่ไม่ปลอดภัย`,
        });
      }

      if (value && !NAME_PATTERN.test(value)) {
        ctx.addIssue({
          code: "custom",
          message:
            `${label}ใช้ได้เฉพาะตัวอักษร ช่องว่าง จุด อะพอสทรอฟี และขีดกลาง`,
        });
      }
    })
    .transform((value) => sanitizeText(value, MAX_NAME_LENGTH));

  // ❗ สำคัญ: ต้อง return
}

/* ---------------- PHONE ---------------- */
function phoneField() {
  return z
    .string()
    .transform((v) => normalizeWhitespace(v).replace(/\s+/g, ""))
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({ code: "custom", message: "กรุณากรอกเบอร์โทร" });
      }

      if (value.length > MAX_PHONE_LENGTH) {
        ctx.addIssue({ code: "custom", message: "เบอร์โทรยาวเกินไป" });
      }

      if (!/^(\+?\d{8,15})$/.test(value)) {
        ctx.addIssue({ code: "custom", message: "เบอร์โทรไม่ถูกต้อง" });
      }
    });
}

/* ---------------- EMAIL (ไม่บังคับ) ---------------- */
function emailField() {
  return z
    .string()
    .optional()
    .default("")
    .transform((v) => normalizeWhitespace(v ?? "").toLowerCase())
    .superRefine((value, ctx) => {
      if (!value) {
        return;
      }

      if (value.length > MAX_EMAIL_LENGTH) {
        ctx.addIssue({ code: "custom", message: "อีเมลยาวเกินไป" });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        ctx.addIssue({ code: "custom", message: "อีเมลไม่ถูกต้อง" });
      }
    });
}

/* ---------------- SCHEMA ---------------- */
export const registrationSchema = z.object({
  firstName: nameField("ชื่อ"),
  lastName: nameField("นามสกุล"),
  nickname: nameField("ชื่อเล่น"),
  phone: phoneField(),
  email: emailField(),

  clientRequestId: z
    .string()
    .regex(UUID_PATTERN, "รหัสคำขอไม่ถูกต้อง")
    .optional()
    .default(() => crypto.randomUUID()),
});

/* ---------------- IMPORT ---------------- */
export const importRowsSchema = z
  .array(
    z.object({
      firstName: nameField("ชื่อ"),
      lastName: nameField("นามสกุล"),
      nickname: nameField("ชื่อเล่น"),
      phone: phoneField(),
      email: emailField(),
    }),
  )
  .min(1, "ต้องมีข้อมูลอย่างน้อย 1 แถว")
  .max(500, "นำเข้าได้สูงสุดครั้งละ 500 แถว");

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type ImportRowsInput = z.infer<typeof importRowsSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}