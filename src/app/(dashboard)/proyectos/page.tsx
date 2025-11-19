"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useListProjects } from "@/hooks/colaboraciones/use-list-projects";
import type { ProjectListFilters } from "@/types/colaboraciones";
import { ProjectFilters } from "@/components/proyectos/project-filters";
import { ProyectoCard } from "@/components/colaboraciones/proyecto-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MisProyectosPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectListFilters>({
    page: 1,
    page_size: 12,
    my_projects: true,
  });

  const { data, isLoading, error } = useListProjects(filters);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.search ||
          filters.estado ||
          filters.tipo ||
          filters.pais ||
          filters.provincia ||
          filters.ciudad
      ),
    [filters]
  );

  const handleFiltersChange = (nextFilters: ProjectListFilters) =>
    setFilters({
      ...nextFilters,
      my_projects: true, // Always limit to own projects
    });

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con diferenciación visual */}
      <div className="relative rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Proyectos</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tus proyectos, edita etapas y controla el progreso de cada iniciativa
              </p>
            </div>
          </div>

          <Button onClick={() => router.push("/proyectos/nuevo")} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Crear Proyecto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="sticky top-6">
            <ProjectFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        </aside>

        <main className="lg:col-span-3">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar tus proyectos. Intenta nuevamente más tarde.
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[300px]" />
              ))}
            </div>
          )}

          {!isLoading && data && data.items.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <h3 className="text-lg font-semibold">Aún no tienes proyectos</h3>
              <p className="text-muted-foreground mt-2">
                {hasActiveFilters
                  ? "No encontramos proyectos con esos filtros."
                  : "Crea tu primer proyecto para comenzar a gestionar tus iniciativas."}
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={() => handleFiltersChange({ page: 1, page_size: filters.page_size })}>
                    Limpiar filtros
                  </Button>
                )}
                <Button onClick={() => router.push("/proyectos/nuevo")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear proyecto
                </Button>
              </div>
            </div>
          )}

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
                    variant="owner"
                    onVerDetalles={() => handleOpenProject(proyecto.id)}
                  />
                ))}
              </div>

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
    </div>
  );
}
