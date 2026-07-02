import type { InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ className, error, id, label, ...props }: TextFieldProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]" htmlFor={inputId}>
      {label}
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          "focus-ring h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-base text-[var(--foreground)] placeholder:text-[var(--muted)]",
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <span className="text-sm font-medium text-[var(--danger)]" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
