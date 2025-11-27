"use client";

import { useMemo, useState } from "react";
import { useListObservaciones } from "@/hooks/observaciones/use-list-observaciones";
import { useObservacionStats } from "@/hooks/observaciones/use-observacion-stats";
import { ObservacionStatsCards } from "@/components/observaciones/observacion-stats-cards";
import { ObservacionTabs } from "@/components/observaciones/observacion-tabs";
import { ObservacionCard } from "@/components/observaciones/observacion-card";
import { EmptyStateObservaciones } from "@/components/observaciones/empty-state-observaciones";
import { ResolverObservacionDialog } from "@/components/observaciones/resolver-observacion-dialog";
import { ObservacionDetailDialog } from "@/components/observaciones/observacion-detail-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { EstadoObservacion, ObservacionWithRelations } from "@/types/observaciones";
import { differenceInDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProjects } from "@/hooks/colaboraciones/use-list-projects";

export default function ObservacionesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("urgentes");
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined);
  const pageSize = 12;

  // Dialog states
  const [selectedObservacion, setSelectedObservacion] = useState<ObservacionWithRelations | null>(null);
  const [resolverDialogOpen, setResolverDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Project filter options (members: only own; council: all)
  const { data: projectsData, isLoading: isLoadingProjects } = useListProjects({
    page: 1,
    page_size: 50,
    my_projects: user?.role === "MEMBER" ? true : undefined,
  });
  const projectOptions = useMemo(() => projectsData?.items ?? [], [projectsData?.items]);

  // Get stats
  const { data: stats, isLoading: isLoadingStats } = useObservacionStats(
    projectFilter
      ? {
          proyecto_id: projectFilter,
        }
      : undefined
  );

  // Build filters based on active tab
  const getFilters = () => {
    const baseFilters = {
      page,
      page_size: pageSize,
      sort_by: "fecha_limite" as const,
      sort_order: "asc" as const,
      proyecto_id: projectFilter,
    };

    if (activeTab === "all") {
      return baseFilters;
    }

    if (activeTab === "urgentes") {
      // Urgentes = vencidas + próximas a vencer (< 3 días)
      // We'll filter on client side for now
      return baseFilters;
    }

    return {
      ...baseFilters,
      estado: activeTab as EstadoObservacion,
    };
  };

  const filters = getFilters();
  const { data, isLoading, error } = useListObservaciones(filters);

  // Filter urgentes on client side (solo PENDIENTES próximas a vencer)
  const getDisplayedItems = () => {
    if (!data?.items) return [];

    if (activeTab === "urgentes") {
      return data.items.filter((obs) => {
        // Solo PENDIENTES que están próximas a vencer (≤ 2 días)
        if (obs.estado === "pendiente") {
          const daysUntilDeadline = differenceInDays(new Date(obs.fecha_limite), new Date());
          return daysUntilDeadline <= 2 && daysUntilDeadline >= 0; // 0, 1 o 2 días restantes
        }
        return false;
      });
    }

    return data.items;
  };

  const displayedItems = getDisplayedItems();

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page
  };

  // Handle stats card click (filter by estado)
  const handleStatsCardClick = (estado: "pendiente" | "vencida" | "resuelta" | "all") => {
    if (estado === "all") {
      setActiveTab("all");
    } else {
      setActiveTab(estado);
    }
    setPage(1);
  };

  // Check if user can resolve (MEMBER role and owns project)
  const canUserResolve = (observacion: ObservacionWithRelations) => {
    if (user?.role !== "MEMBER") return false;
    return observacion.executor_user?.id === user?.id;
  };

  // Get urgentes count (solo PENDIENTES próximas a vencer)
  const urgentesCount = data?.items.filter((obs) => {
    if (obs.estado === "pendiente") {
      const days = differenceInDays(new Date(obs.fecha_limite), new Date());
      return days <= 2 && days >= 0; // 0, 1 o 2 días restantes
    }
    return false;
  }).length ?? 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="relative rounded-lg bg-gradient-to-r from-blue-50 via-purple-50 to-transparent p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Panel de Observaciones</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona observaciones del consejo y responde a las solicitudes de tus proyectos
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="w-full max-w-xs">
            <p className="text-xs text-muted-foreground mb-1">Filtrar por proyecto</p>
            <Select
              value={projectFilter ?? "all"}
              onValueChange={(val) => {
                setProjectFilter(val === "all" ? undefined : val);
                setPage(1);
              }}
              disabled={isLoadingProjects}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingProjects ? "Cargando..." : "Todos los proyectos"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projectOptions.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <ObservacionStatsCards
        stats={stats}
        isLoading={isLoadingStats}
        onClickCard={handleStatsCardClick}
      />

      {/* Tabs */}
      <ObservacionTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          all: stats?.total,
          urgentes: urgentesCount,
          pendiente: stats?.pendientes,
          vencida: stats?.vencidas,
          resuelta: stats?.resueltas,
        }}
      />

      {/* Content */}
      <div>
        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las observaciones. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && displayedItems.length === 0 && (
          <EmptyStateObservaciones
            type={
              activeTab === "urgentes"
                ? "no-urgentes"
                : activeTab === "resuelta"
                  ? "no-resueltas"
                  : data?.total === 0
                    ? "no-observaciones"
                    : "no-results"
            }
          />
        )}

        {/* Observations grid */}
        {!isLoading && !error && displayedItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedItems.map((observacion) => (
                <ObservacionCard
                  key={observacion.id}
                  observacion={observacion}
                  variant="compact"
                  showProject={true}
                  canResolve={canUserResolve(observacion)}
                  onResolve={() => {
                    setSelectedObservacion(observacion);
                    setResolverDialogOpen(true);
                  }}
                  onViewDetails={() => {
                    setSelectedObservacion(observacion);
                    setDetailDialogOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <ResolverObservacionDialog
        open={resolverDialogOpen}
        onOpenChange={setResolverDialogOpen}
        observacion={selectedObservacion}
      />

      <ObservacionDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        observacion={selectedObservacion}
        canResolve={selectedObservacion ? canUserResolve(selectedObservacion) : false}
        onResolve={() => {
          setDetailDialogOpen(false);
          setResolverDialogOpen(true);
        }}
      />
    </div>
  );
}
