import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "../../lib/utils";

export type ChartConfig = {
    [key: string]: {
        label?: string;
        color?: string;
    };
};

type ChartContextProps = {
    config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />");
    }

    return context;
}

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children: React.ReactElement;
};

export function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
    const uniqueId = React.useId();
    const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-chart={chartId}
                className={cn(
                    "h-[220px] w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-outline [&_.recharts-cartesian-grid_line]:stroke-outline-variant/60 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-surface-container [&_.recharts-tooltip-wrapper]:outline-none",
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
    const colorConfig = Object.entries(config).filter(([, conf]) => conf.color);

    if (!colorConfig.length) {
        return null;
    }

    const css = colorConfig
        .map(([key, conf]) => `  --color-${key}: ${conf.color};`)
        .join("\n");

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `[data-chart=\"${id}\"] {\n${css}\n}`,
            }}
        />
    );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function useChartConfig() {
    return useChart().config;
}
