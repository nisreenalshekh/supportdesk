import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // used for aria-label and the native tooltip
  bare?: boolean;
  dot?: boolean;
  children: ReactNode;
}

export default function IconButton({ label, bare, dot, children, className = "", ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-btn ${bare ? "icon-btn--bare" : ""} ${className}`}
      {...rest}
    >
      {children}
      {dot && <span className="dot" />}
    </button>
  );
}
