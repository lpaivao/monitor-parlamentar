import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils";

function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />;
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-low px-2",
                className,
            )}
            {...props}
        />
    );
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "inline-flex h-full items-center justify-center whitespace-nowrap border-b-2 border-transparent px-4 text-[13px] font-medium text-outline transition-colors outline-none hover:text-on-surface data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-primary",
                className,
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
    return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props} />;
}

interface TabItem {
    value: string;
    label: string;
}

interface TabsFieldProps {
    value: string;
    onValueChange: (value: string) => void;
    items: TabItem[];
    children: ReactNode;
}

export function TabsField({ value, onValueChange, items, children }: TabsFieldProps) {
    return (
        <Tabs value={value} onValueChange={onValueChange}>
            <TabsList aria-label="Abas de visualizacao">
                {items.map((item) => (
                    <TabsTrigger key={item.value} value={item.value}>
                        {item.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {children}
        </Tabs>
    );
}

interface TabPanelProps {
    value: string;
    children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
    return <TabsContent value={value}>{children}</TabsContent>;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };

