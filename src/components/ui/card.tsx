import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "surface" | "soft";
  padding?: "none" | "default";
};

export function Card({
  className = "",
  variant = "surface",
  padding = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={`card card--${variant} card--padding-${padding} ${className}`.trim()}
      {...props}
    />
  );
}
