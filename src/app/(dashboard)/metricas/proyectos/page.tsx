"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderOpen, Search } from "lucide-react";

import { useListProjects } from "@/hooks/colaboraciones/use-list-projects";
import type { ProjectListFilters, ProyectoBasic } from "@/types/colaboraciones";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const estadoCopy: Record<string, string> = {
  pendiente: "Pendiente",
  en_ejecucion: "En ejecución",
  finalizado: "Finalizado",
};

const estadoColor: Record<string, string> = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-900",
  en_ejecucion: "border-blue-200 bg-blue-50 text-blue-900",
  finalizado: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

function ProjectCard({ proyecto, onView }: { proyecto: ProyectoBasic; onView: () => void }) {
  return (
    <Card className="h-full border-border/70">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">{proyecto.titulo}</CardTitle>
            <CardDescription className="line-clamp-2">{proyecto.descripcion}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ${estadoColor[proyecto.estado] ?? "border-muted bg-muted/40"}`}
          >
            {estadoCopy[proyecto.estado] ?? proyecto.estado}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {proyecto.ciudad ? `${proyecto.ciudad}, ${proyecto.provincia}` : proyecto.provincia || proyecto.pais}
        </div>
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Actualizado</span>
          <span className="font-medium">{new Date(proyecto.updated_at).toLocaleDateString()}</span>
        </div>
        <Button className="w-full" size="sm" onClick={onView}>
          Ver datos y métricas
        </Button>
      </CardContent>
    </Card>
  );
}

export default function MetricsProjectsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectListFilters>({
    page: 1,
    page_size: 12,
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const { data, isLoading } = useListProjects(filters);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, page: 1, search: value || undefined }));
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-slate-50 to-transparent p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Council</p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900">
              Proyectos con métricas
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explorá el portafolio, abrí cualquier proyecto y revisá su ficha de datos y métricas en vivo.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderOpen className="h-4 w-4" />
          <span className="text-sm">
            {data ? `Mostrando ${data.items.length} de ${data.total} proyectos` : "Cargando proyectos..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, ciudad..."
              className="pl-9 w-[260px]"
              defaultValue={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No encontramos proyectos para mostrar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((proyecto) => (
            <ProjectCard
              key={proyecto.id}
              proyecto={proyecto}
              onView={() => router.push(`/metricas/proyectos/${proyecto.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
