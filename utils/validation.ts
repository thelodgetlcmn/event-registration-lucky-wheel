import { z } from "zod";

import {
  containsHtml,
  containsSqlLikeInput,
  normalizeWhitespace,
  sanitizeText,
} from "@/utils/sanitize";

const MAX_NAME_LENGTH = 60;
const NAME_PATTERN = /^[\p{L}\p{M}\s.'-]+$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nameField(label: string) {
  return z
    .string({ error: `${label} ต้องเป็นข้อความ` })
    .superRefine((value, ctx) => {
      const normalized = normalizeWhitespace(value);

      if (normalized.length === 0) {
        ctx.addIssue({ code: "custom", message: `กรุณากรอก${label}` });
      }

      if (normalized.length > MAX_NAME_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: `${label}ต้องไม่เกิน ${MAX_NAME_LENGTH} ตัวอักษร`,
        });
      }

      if (containsHtml(value)) {
        ctx.addIssue({ code: "custom", message: `${label}ห้ามมี HTML หรือ script` });
      }

      if (containsSqlLikeInput(value)) {
        ctx.addIssue({ code: "custom", message: `${label}มีรูปแบบที่ไม่ปลอดภัย` });
      }

      if (normalized.length > 0 && !NAME_PATTERN.test(normalized)) {
        ctx.addIssue({
          code: "custom",
          message: `${label}ใช้ได้เฉพาะตัวอักษร ช่องว่าง จุด อะพอสทรอฟี และขีดกลาง`,
        });
      }
    })
    .transform((value) => sanitizeText(value, MAX_NAME_LENGTH));
}

export const registrationSchema = z.object({
  firstName: nameField("ชื่อ"),
  lastName: nameField("นามสกุล"),
  clientRequestId: z
    .string()
    .regex(UUID_PATTERN, "รหัสคำขอไม่ถูกต้อง")
    .optional()
    .default(() => crypto.randomUUID()),
});

export const importRowsSchema = z
  .array(
    z.object({
      firstName: nameField("ชื่อ"),
      lastName: nameField("นามสกุล"),
    }),
  )
  .min(1, "ต้องมีข้อมูลอย่างน้อย 1 แถว")
  .max(500, "นำเข้าได้สูงสุดครั้งละ 500 แถว");

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type ImportRowsInput = z.infer<typeof importRowsSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}
