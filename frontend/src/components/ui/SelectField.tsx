import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

function Select({ ...props }: ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            className={cn(
                "inline-flex min-w-0 items-center justify-between gap-2 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-medium text-[var(--text-strong)] outline-none transition-all placeholder:text-[var(--text-dim)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-raised)] focus:border-[var(--accent-border)] focus:shadow-[0_0_0_3px_var(--accent-dim)] disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                className={cn(
                    "relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-raised)] text-[var(--text)] shadow-[var(--shadow-lg)]",
                    className,
                )}
                position="popper"
                {...props}
            >
                <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center text-[var(--text-muted)]">
                    <ChevronUp className="h-4 w-4" />
                </SelectPrimitive.ScrollUpButton>
                <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
                <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center text-[var(--text-muted)]">
                    <ChevronDown className="h-4 w-4" />
                </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-[var(--radius-sm)] py-2 pl-8 pr-2 text-[13px] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text-h)]",
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-[var(--accent)]">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

const EMPTY_SENTINEL = "__radix_empty_value__";

function toRadixValue(value: string) {
    return value === "" ? EMPTY_SENTINEL : value;
}

function fromRadixValue(value: string) {
    return value === EMPTY_SENTINEL ? "" : value;
}

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectFieldProps {
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SelectField({
    value,
    options,
    onValueChange,
    placeholder,
    className,
}: SelectFieldProps) {
    return (
        <Select value={toRadixValue(value)} onValueChange={(next) => onValueChange(fromRadixValue(next))}>
            <SelectTrigger className={className} aria-label={placeholder}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent sideOffset={6}>
                {options.map((option) => (
                    <SelectItem key={option.value || EMPTY_SENTINEL} value={toRadixValue(option.value)}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
