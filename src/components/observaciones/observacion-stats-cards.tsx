"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle2, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ObservacionStats } from "@/types/observaciones";

interface ObservacionStatsCardsProps {
  stats: ObservacionStats | undefined;
  isLoading: boolean;
  onClickCard?: (estado: "pendiente" | "vencida" | "resuelta" | "all") => void;
}

export function ObservacionStatsCards({
  stats,
  isLoading,
  onClickCard,
}: ObservacionStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  type CardId = "pendiente" | "vencida" | "resuelta" | "all";
  const cards: {
    id: CardId;
    title: string;
    value: number;
    icon: typeof Clock | typeof AlertTriangle | typeof CheckCircle2 | typeof FileText;
    gradient: string;
    iconColor: string;
    borderColor: string;
  }[] = [
    {
      id: "pendiente",
      title: "Pendientes",
      value: stats?.pendientes ?? 0,
      icon: Clock,
      gradient: "from-yellow-100 to-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-300",
    },
    {
      id: "vencida",
      title: "Vencidas",
      value: stats?.vencidas ?? 0,
      icon: AlertTriangle,
      gradient: "from-red-100 to-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-300",
    },
    {
      id: "resuelta",
      title: "Resueltas",
      value: stats?.resueltas ?? 0,
      icon: CheckCircle2,
      gradient: "from-green-100 to-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-300",
    },
    {
      id: "all",
      title: "Total",
      value: stats?.total ?? 0,
      icon: FileText,
      gradient: "from-blue-100 to-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = onClickCard && card.id !== "all";

        return (
          <Card
            key={card.id}
            className={cn(
              "relative overflow-hidden border-2",
              card.borderColor,
              isClickable && "cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            )}
            onClick={() => isClickable && onClickCard?.(card.id)}
          >
            <CardContent className={cn("pt-6 pb-4 bg-gradient-to-br", card.gradient)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={cn("p-3 rounded-full bg-white/50", card.iconColor)}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              {/* Trend indicator (if available) */}
              {card.id === "pendiente" && stats?.pendientes_trend !== undefined && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className={stats.pendientes_trend > 0 ? "text-red-600" : "text-green-600"}>
                    {stats.pendientes_trend > 0 ? "↗" : "↘"} {Math.abs(stats.pendientes_trend)} desde ayer
                  </span>
                </div>
              )}
              {card.id === "vencida" && stats?.vencidas_trend !== undefined && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className={stats.vencidas_trend > 0 ? "text-red-600" : "text-green-600"}>
                    {stats.vencidas_trend > 0 ? "↗" : "↘"} {Math.abs(stats.vencidas_trend)} desde ayer
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
