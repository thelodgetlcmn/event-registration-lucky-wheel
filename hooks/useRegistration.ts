"use client";

import { useState } from "react";
import { ZodError } from "zod";

import type { Registrant, RegistrationFormValues } from "@/types/registration";

import { registerParticipant } from "@/services/register";
import { formatZodError } from "@/utils/validation";

interface UseRegistrationResult {
  isSubmitting: boolean;
  submit: (values: Omit<RegistrationFormValues, "clientRequestId">) => Promise<Registrant>;
}

export function useRegistration(): UseRegistrationResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(
    values: Omit<RegistrationFormValues, "clientRequestId">,
  ): Promise<Registrant> {
    setIsSubmitting(true);
    try {
      return await registerParticipant({
        ...values,
        clientRequestId: crypto.randomUUID(),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(formatZodError(error));
      }

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submit };
}
