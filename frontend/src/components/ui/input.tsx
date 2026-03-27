import * as React from "react";
import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "font-sans text-[13px] font-medium text-[var(--text-strong)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3.5 py-2 outline-none transition-all placeholder:text-[var(--text-dim)] focus:border-[var(--accent-border)] focus:bg-[var(--bg-raised)] focus:shadow-[0_0_0_3px_var(--accent-dim)] disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        />
    );
}

export { Input };
