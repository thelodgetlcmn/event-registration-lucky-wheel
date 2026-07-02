import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)] disabled:bg-[color-mix(in_srgb,var(--primary)_48%,transparent)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]",
  danger: "bg-[var(--danger)] text-white hover:brightness-95 disabled:opacity-60",
  ghost: "text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
};

export function Button({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
      <span>{children}</span>
    </button>
  );
}
