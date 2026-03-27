import { Table as RadixTable } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef } from "react";

function cx(...classes: Array<string | undefined>) {
    return classes.filter(Boolean).join(" ");
}

type TableRootProps = ComponentPropsWithoutRef<typeof RadixTable.Root> & {
    containerClassName?: string;
};

function Root({
    children,
    className,
    containerClassName,
    size = "2",
    variant = "surface",
    ...props
}: TableRootProps) {
    return (
        <div className={cx("overflow-x-auto overflow-y-auto", containerClassName)}>
            <RadixTable.Root
                size={size}
                variant={variant}
                className={cx("w-full text-[13.5px]", className)}
                {...props}
            >
                {children}
            </RadixTable.Root>
        </div>
    );
}

function Header(props: ComponentPropsWithoutRef<typeof RadixTable.Header>) {
    return <RadixTable.Header {...props} />;
}

function Body(props: ComponentPropsWithoutRef<typeof RadixTable.Body>) {
    return <RadixTable.Body {...props} />;
}

function Row({ className, ...props }: ComponentPropsWithoutRef<typeof RadixTable.Row>) {
    return (
        <RadixTable.Row
            className={cx(
                "border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors",
                className,
            )}
            {...props}
        />
    );
}

function ColumnHeaderCell({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof RadixTable.ColumnHeaderCell>) {
    return (
        <RadixTable.ColumnHeaderCell
            className={cx(
                "px-4 py-3.5 text-left font-sans text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest border-b border-[var(--border)] whitespace-nowrap bg-[var(--bg-surface)] sticky top-0 z-10",
                className,
            )}
            {...props}
        />
    );
}

function Cell({ className, ...props }: ComponentPropsWithoutRef<typeof RadixTable.Cell>) {
    return (
        <RadixTable.Cell
            className={cx("px-4 py-3.5 align-middle text-[13px] text-[var(--text)]", className)}
            {...props}
        />
    );
}

function RowHeaderCell({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof RadixTable.RowHeaderCell>) {
    return (
        <RadixTable.RowHeaderCell
            className={cx("px-4 py-3.5 align-middle text-[13px] text-[var(--text-strong)]", className)}
            {...props}
        />
    );
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
