import type { HTMLAttributes, ReactNode } from "react";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  children: ReactNode;
  tone?: "info" | "success" | "eco";
  live?: boolean;
};

export function Alert({ title, children, tone = "info", live = false, className = "", ...props }: AlertProps) {
  return (
    <div
      className={`alert alert--${tone} ${className}`.trim()}
      aria-live={live ? "polite" : undefined}
      {...props}
    >
      <span className="alert__mark" aria-hidden="true">{tone === "success" ? "✓" : "i"}</span>
      <div><strong>{title}</strong><div>{children}</div></div>
    </div>
  );
}
