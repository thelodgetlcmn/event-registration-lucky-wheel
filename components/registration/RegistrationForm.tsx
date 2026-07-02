"use client";

import { CheckCircle2, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useRegistration } from "@/hooks/useRegistration";
import { toastFromError, useToast } from "@/hooks/useToast";
import type { Registrant } from "@/types/registration";

export function RegistrationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [latestRegistrant, setLatestRegistrant] = useState<Registrant | null>(null);
  const { isSubmitting, submit } = useRegistration();
  const showToast = useToast((state) => state.showToast);

  const isDirty = useMemo(
    () => firstName.trim().length > 0 || lastName.trim().length > 0,
    [firstName, lastName],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const registrant = await submit({ firstName, lastName });
      setLatestRegistrant(registrant);
      setFirstName("");
      setLastName("");
      showToast({
        title: "ลงทะเบียนสำเร็จ",
        description: `${registrant.firstName} ${registrant.lastName}`,
        tone: "success",
      });
    } catch (error) {
      showToast(toastFromError(error, "ลงทะเบียนไม่สำเร็จ"));
    }
  }

  return (
    <form className="glass-panel grid gap-5 rounded-lg p-5 sm:p-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <p className="text-sm font-bold text-[var(--primary)]">Event Registration</p>
        <h1 className="text-3xl font-black sm:text-4xl">ลงทะเบียนเข้าร่วมงาน</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          autoComplete="given-name"
          label="ชื่อ"
          maxLength={60}
          name="firstName"
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="เช่น สมชาย"
          required
          value={firstName}
        />
        <TextField
          autoComplete="family-name"
          label="นามสกุล"
          maxLength={60}
          name="lastName"
          onChange={(event) => setLastName(event.target.value)}
          placeholder="เช่น ใจดี"
          required
          value={lastName}
        />
      </div>

      <Button
        className="w-full sm:w-fit"
        disabled={!isDirty}
        icon={<Send aria-hidden="true" className="h-4 w-4" />}
        isLoading={isSubmitting}
        type="submit"
      >
        ลงทะเบียน
      </Button>

      {latestRegistrant ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--success)_36%,var(--border))] bg-[color-mix(in_srgb,var(--success)_8%,transparent)] p-4">
          <div className="flex items-center gap-2 font-bold text-[var(--success)]">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            บันทึกข้อมูลแล้ว
          </div>
          <p className="mt-2 break-all text-sm text-[var(--muted)]">
            UUID: {latestRegistrant.uuid}
          </p>
        </div>
      ) : null}
    </form>
  );
}
