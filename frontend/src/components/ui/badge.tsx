import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap",
    {
        variants: {
            variant: {
                neutral:
                    "text-[var(--text-strong)] bg-[var(--bg-raised)] border-[var(--border-strong)]",
                accent:
                    "text-[var(--accent)] bg-[var(--accent-dim)] border-[var(--accent-border)]",
            },
        },
        defaultVariants: {
            variant: "neutral",
        },
    },
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}