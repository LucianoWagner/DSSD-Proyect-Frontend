"use client";

/**
 * Página para explorar proyectos y enviar ofertas
 * Solo visible para usuarios MEMBER (ONGs)
 */

import { useMemo, useState } from "react";
import { useListProjects } from "@/hooks/colaboraciones/use-list-projects";
import { ProjectFilters } from "@/components/proyectos/project-filters";
import { ProyectoCard } from "@/components/colaboraciones/proyecto-card";
import { ProyectoDetailDialog } from "@/components/colaboraciones/proyecto-detail-dialog";
import { EmptyState } from "@/components/colaboraciones/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, Search, Heart } from "lucide-react";
import type { ProjectListFilters } from "@/types/colaboraciones";
import { useAuth } from "@/hooks/use-auth";

export default function IntercambiosPage() {
  const [filters, setFilters] = useState<ProjectListFilters>({
    page: 1,
    page_size: 12,
    my_projects: false, // No mostrar mis propios proyectos
  });
  const { user } = useAuth();
  const isMember = user?.role === "MEMBER";

  const filtersWithRole = useMemo(
    () => (isMember ? { ...filters, estado: "pendiente" } : filters),
    [filters, isMember]
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data, isLoading, error } = useListProjects(filtersWithRole);

  const handleVerDetalles = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDetailDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.estado ||
      filters.tipo ||
      filters.pais ||
      filters.provincia ||
      filters.ciudad
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header con diferenciación visual */}
      <div className="relative rounded-lg bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent p-6 border border-secondary/30 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-secondary/20 rounded-lg">
            <Search className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">Explorar Proyectos</h1>
              <Heart className="h-5 w-5 text-secondary-foreground fill-current opacity-70" />
            </div>
            <p className="text-muted-foreground">
              Descubrí proyectos de otras ONGs y enviá ofertas de colaboración para ayudar
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar con filtros */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6">
            <ProjectFilters
              filters={filters}
              onFiltersChange={setFilters}
              showEstadoFilter={!isMember}
            />
          </div>
        </aside>

        {/* Grid de proyectos */}
        <main className="lg:col-span-3">
          {/* Error state */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar proyectos. Por favor, intenta de nuevo.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px]" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && data && data.items.length === 0 && (
            <EmptyState
              type={hasActiveFilters ? "no-results" : "no-projects"}
              onAction={
                hasActiveFilters
                  ? () => setFilters({ page: 1, page_size: 12 })
                  : undefined
              }
              actionLabel={hasActiveFilters ? "Limpiar filtros" : undefined}
            />
          )}

          {/* Projects grid */}
          {!isLoading && data && data.items.length > 0 && (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Mostrando {data.items.length} de {data.total} proyectos
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.items.map((proyecto) => (
                  <ProyectoCard
                    key={proyecto.id}
                    proyecto={proyecto}
                    onVerDetalles={() => handleVerDetalles(proyecto.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  <span className="text-sm text-muted-foreground px-4">
                    Página {filters.page} de {data.total_pages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === data.total_pages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Dialog de detalle del proyecto */}
      <ProyectoDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        projectId={selectedProjectId}
      />
    </div>
  );
}
