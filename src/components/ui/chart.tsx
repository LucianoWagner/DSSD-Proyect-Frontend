"use client";

import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Legend,
  Tooltip,
} from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    icon?: ReactNode;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
  }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

/**
 * Wrap charts with a container that injects CSS variables for each series color.
 * Use `var(--color-KEY)` in chart fills to stay theme-aware.
 */
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, ...props }, ref) => {
    const style = React.useMemo(() => {
      const cssVars: Record<string, string> = {};

      for (const [key, value] of Object.entries(config)) {
        const color = value.color ?? value.theme?.light;
        if (color) {
          cssVars[`--color-${key}`] = color;
        }
      }

      return cssVars as CSSProperties;
    }, [config]);

    return (
      <div
        ref={ref}
        className={cn("flex w-full flex-col gap-2", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

/**
 * Minimal tooltip wrapper with a shadcn-styled surface.
 */
export function ChartTooltip(contentProps?: React.ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip
      {...contentProps}
      wrapperStyle={{ outline: "none" }}
      content={<ChartTooltipContent />}
    />
  );
}

interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    color?: string;
    value?: number | string;
  }>;
  label?: string | number;
}

export function ChartTooltipContent({ active, payload, label }: TooltipContentProps) {
  const items = payload;

  if (!active || !items || items.length === 0) return null;

  return (
    <div className="rounded-md border bg-popover/90 p-3 text-xs shadow-md backdrop-blur">
      {label && <p className="mb-2 text-[11px] uppercase text-muted-foreground">{label}</p>}
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color || "var(--foreground)" }}
              />
              <span className="text-foreground/80">{item.name ?? item.dataKey}</span>
            </span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LegendContentProps {
  payload?: Array<{
    value?: string | number;
    color?: string;
  }>;
}

export function ChartLegendContent({ payload }: LegendContentProps) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {payload.map((entry) => (
        <span key={entry.value} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color || "var(--foreground)" }}
          />
          <span className="text-foreground/70">{entry.value}</span>
        </span>
      ))}
    </div>
  );
}

export const ChartLegend = Legend;
