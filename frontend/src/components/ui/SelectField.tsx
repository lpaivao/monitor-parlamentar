import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";

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
        <Select.Root value={toRadixValue(value)} onValueChange={(next) => onValueChange(fromRadixValue(next))}>
            <Select.Trigger className={`radix-select-trigger ${className ?? ""}`.trim()} aria-label={placeholder}>
                <Select.Value placeholder={placeholder} />
                <Select.Icon className="radix-select-icon">
                    <ChevronDownIcon />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content className="radix-select-content" position="popper" sideOffset={6}>
                    <Select.ScrollUpButton className="radix-select-scroll">
                        <ChevronUpIcon />
                    </Select.ScrollUpButton>

                    <Select.Viewport className="radix-select-viewport">
                        {options.map((option) => (
                            <Select.Item key={option.value || EMPTY_SENTINEL} value={toRadixValue(option.value)} className="radix-select-item">
                                <Select.ItemText>{option.label}</Select.ItemText>
                                <Select.ItemIndicator className="radix-select-item-indicator">
                                    <CheckIcon />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>

                    <Select.ScrollDownButton className="radix-select-scroll">
                        <ChevronDownIcon />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
