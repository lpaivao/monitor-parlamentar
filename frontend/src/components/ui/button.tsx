import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] text-[13px] font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-40",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-white border border-transparent hover:brightness-105",
                outline:
                    "border border-outline-variant bg-surface-container-low text-outline hover:text-on-surface hover:bg-white hover:border-outline",
                ghost:
                    "text-outline hover:text-on-surface hover:bg-surface-container-low",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 px-3",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    };

export function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}