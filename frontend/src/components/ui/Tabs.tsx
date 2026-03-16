import * as Tabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

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
        <Tabs.Root value={value} onValueChange={onValueChange}>
            <Tabs.List className="radix-tabs-list" aria-label="Abas de visualizacao">
                {items.map((item) => (
                    <Tabs.Trigger key={item.value} value={item.value} className="radix-tabs-trigger">
                        {item.label}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>
            {children}
        </Tabs.Root>
    );
}

interface TabPanelProps {
    value: string;
    children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
    return <Tabs.Content value={value}>{children}</Tabs.Content>;
}
