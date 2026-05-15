import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-white hover:opacity-80",
        secondary:
          "border-transparent bg-[var(--muted)] text-[var(--foreground)] hover:opacity-80",
        destructive:
          "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-80",
        outline:
          "text-[var(--foreground)] border-[var(--border)]",
        success:
          "border-transparent bg-[oklch(0.55_0.18_145)] text-white",
        warning:
          "border-transparent bg-[oklch(0.72_0.18_60)] text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
