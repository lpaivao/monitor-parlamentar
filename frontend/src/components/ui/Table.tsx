/* eslint-disable react-refresh/only-export-components */
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type TableRootProps = ComponentPropsWithoutRef<"table"> & {
    containerClassName?: string;
};

function Root({ children, className, containerClassName, ...props }: TableRootProps) {
    return (
        <div className={cn("overflow-x-auto overflow-y-auto", containerClassName)}>
            <table className={cn("w-full caption-bottom text-[13.5px]", className)} {...props}>
                {children}
            </table>
        </div>
    );
}

function Header(props: ComponentPropsWithoutRef<"thead">) {
    return <thead {...props} />;
}

function Body(props: ComponentPropsWithoutRef<"tbody">) {
    return <tbody {...props} />;
}

function Row({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
    return (
        <tr
            className={cn(
                "border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--bg-hover)]",
                className,
            )}
            {...props}
        />
    );
}

function ColumnHeaderCell({ className, ...props }: ComponentPropsWithoutRef<"th">) {
    return (
        <th
            className={cn(
                "sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3.5 text-left font-sans text-[11px] font-semibold tracking-widest text-[var(--text-dim)] uppercase whitespace-nowrap",
                className,
            )}
            {...props}
        />
    );
}

function Cell({ className, ...props }: ComponentPropsWithoutRef<"td">) {
    return <td className={cn("px-4 py-3.5 align-middle text-[13px] text-[var(--text)]", className)} {...props} />;
}

function RowHeaderCell({ className, ...props }: ComponentPropsWithoutRef<"th">) {
    return <th className={cn("px-4 py-3.5 align-middle text-left text-[13px] text-[var(--text-strong)]", className)} {...props} />;
}

export const Table = {
    Root,
    Header,
    Body,
    Row,
    ColumnHeaderCell,
    Cell,
    RowHeaderCell,
};
