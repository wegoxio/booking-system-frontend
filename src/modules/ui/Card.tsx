import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
};

export default function Card({
  className = "",
  elevated = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#e4e4e8] bg-[#fafafc] ${
        elevated ? "shadow-[0_8px_24px_rgba(42,45,58,0.06)]" : ""
      } ${className}`.trim()}
      {...props}
    />
  );
}
