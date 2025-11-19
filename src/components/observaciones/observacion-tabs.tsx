"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import type { EstadoObservacion } from "@/types/observaciones";

interface ObservacionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    all?: number;
    urgentes?: number;
    pendiente?: number;
    vencida?: number;
    resuelta?: number;
  };
}

export function ObservacionTabs({ activeTab, onTabChange, counts }: ObservacionTabsProps) {
  const tabs = [
    {
      value: "urgentes",
      label: "Urgentes",
      icon: Flame,
      count: counts?.urgentes,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "pendiente",
      label: "Pendientes",
      icon: Clock,
      count: counts?.pendiente,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "vencida",
      label: "Vencidas",
      icon: AlertTriangle,
      count: counts?.vencida,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "resuelta",
      label: "Resueltas",
      icon: CheckCircle2,
      count: counts?.resuelta,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "all",
      label: "Todas",
      icon: FileText,
      count: counts?.all,
      color: "bg-blue-100 text-blue-800",
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 py-2.5"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className={tab.color}>
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
