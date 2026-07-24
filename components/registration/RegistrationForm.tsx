"use client";

import { CheckCircle2, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useRegistration } from "@/hooks/useRegistration";
import { toastFromError, useToast } from "@/hooks/useToast";
import type { Registrant } from "@/types/registration";

export function RegistrationForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { isSubmitting, submit } = useRegistration();
  const showToast = useToast((state) => state.showToast);

  const isDirty = useMemo(
    () =>
      firstName.trim() &&
      lastName.trim() &&
      nickname.trim() &&
      phone.trim(),
    [firstName, lastName, nickname, phone],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const registrant = await submit({
        firstName,
        lastName,
        nickname,
        phone,
        email,
      });


      setFirstName("");
      setLastName("");
      setNickname("");
      setPhone("");
      setEmail("");

      router.replace(
        `/success?name=${encodeURIComponent(
          `${registrant.firstName} ${registrant.lastName}`,
        )}`,
      );
      } catch (error) {
      showToast(toastFromError(error, "ลงทะเบียนไม่สำเร็จ"));
    }
  }

  return (
    <form
      className="glass-panel grid gap-5 rounded-lg p-5 sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <p className="text-sm font-bold text-[var(--primary)]">
          Event Registration
        </p>

        <h1 className="text-3xl font-black">
          ลงทะเบียนเข้าร่วมงาน
        </h1>
      </div>

      <div className="grid gap-4">

        <TextField
          label="ชื่อ"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <TextField
          label="นามสกุล"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <TextField
          label="ชื่อเล่น"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        <TextField
          label="เบอร์โทร"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <TextField
          label="Email (ไม่บังคับ)"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

      </div>

      <Button
        className="w-full"
        disabled={!isDirty}
        icon={<Send className="h-4 w-4" />}
        isLoading={isSubmitting}
        type="submit"
      >
        ลงทะเบียน
      </Button>

    </form>
  );
}