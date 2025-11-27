"use client";

import { useState } from "react";
import { Calendar, Folder, MapPin, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { paths } from "@/types/openapi";

type ProjectDetailResponse = paths["/api/v1/projects/{project_id}"]["get"]["responses"][200]["content"]["application/json"];
type EtapaWithCounts = ProjectDetailResponse["etapas"][number] & {
  pedidos_total_count?: number;
  pedidos_pendientes_count?: number;
};

interface ProjectDetailsPanelProps {
  project: ProjectDetailResponse | undefined;
  isLoading: boolean;
  showEmpty: boolean;
}

// Helper to get badge variant based on estado
function getEstadoBadgeVariant(estado: string): "default" | "secondary" | "outline" | "destructive" {
  const normalizedEstado = estado.toLowerCase().replace(/_/g, "");

  if (normalizedEstado === "pendiente" || normalizedEstado === "planificacion") {
    return "secondary";
  }
  if (normalizedEstado === "enejecucion") {
    return "default";
  }
  if (normalizedEstado === "completado") {
    return "outline";
  }
  if (normalizedEstado === "rechazado" || normalizedEstado === "cancelado") {
    return "destructive";
  }
  return "outline";
}

function formatEstado(estado: string): string {
  return estado
    .toLowerCase()
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ProjectDetailsPanel({
  project,
  isLoading,
  showEmpty,
}: ProjectDetailsPanelProps) {
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());

  const toggleEtapa = (etapaId: string) => {
    setExpandedEtapas((prev) => {
      const next = new Set(prev);
      if (next.has(etapaId)) {
        next.delete(etapaId);
      } else {
        next.add(etapaId);
      }
      return next;
    });
  };

  // Empty state
  if (showEmpty && !isLoading) {
    return (
      <Card className="h-fit sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-slate-50 border-slate-200">
            <AlertCircle className="h-4 w-4 text-slate-600" />
            <AlertTitle className="text-slate-900">Selecciona un proyecto</AlertTitle>
            <AlertDescription className="text-slate-700">
              Elige un proyecto en la lista para ver sus detalles completos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-fit sticky top-6">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Loaded state
  if (!project) return null;

  return (
    <Card className="h-fit sticky top-6 border-primary/20">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl leading-snug line-clamp-2">
              {project.titulo}
            </CardTitle>
            <Badge variant={getEstadoBadgeVariant(project.estado)} className="shrink-0">
              {formatEstado(project.estado)}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            ID: {project.id.slice(0, 8)}...
          </CardDescription>
        </div>
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <CardContent className="space-y-6 pr-4">
          {/* Metadata Section */}
          <div className="space-y-3 border-b pb-4">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {project.ciudad}
                  {project.provincia && `, ${project.provincia}`}
                </span>
                <span className="text-xs text-muted-foreground">{project.pais}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-foreground">{project.tipo}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">
                Creado {format(new Date(project.created_at), "dd MMM yyyy", { locale: es })}
              </span>
            </div>
          </div>

          {/* Description Section */}
          {project.descripcion && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Descripción</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {project.descripcion}
              </p>
            </div>
          )}

          {/* Etapas Section */}
          {project.etapas && project.etapas.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                Etapas ({project.etapas.length})
              </h4>
              <div className="space-y-2">
                {project.etapas.map((etapaRaw) => {
                  const etapa = etapaRaw as EtapaWithCounts;
                  return (
                    <div
                      key={etapa.id}
                      className="border rounded-lg overflow-hidden bg-card transition-colors hover:bg-muted/50"
                    >
                      <button
                        onClick={() => toggleEtapa(etapa.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${
                              expandedEtapas.has(etapa.id) ? "rotate-180" : ""
                            }`}
                          />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-medium text-foreground truncate">
                              {etapa.nombre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {etapa.fecha_inicio && etapa.fecha_fin && (
                                <>
                                  {format(new Date(etapa.fecha_inicio), "dd MMM", {
                                    locale: es,
                                  })}{" "}
                                  → {format(new Date(etapa.fecha_fin), "dd MMM", {
                                    locale: es,
                                  })}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {etapa.pedidos_total_count !== undefined && (
                            <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                              {etapa.pedidos_total_count} pedido{etapa.pedidos_total_count !== 1 ? "s" : ""}
                            </span>
                          )}
                          <Badge
                            variant={getEstadoBadgeVariant(etapa.estado || "")}
                            className="shrink-0 text-xs"
                          >
                            {formatEstado(etapa.estado || "pendiente")}
                          </Badge>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedEtapas.has(etapa.id) && (
                        <div className="px-3 py-2 border-t bg-muted/20 space-y-2 text-xs">
                          {etapa.descripcion && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Descripción:</p>
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {etapa.descripcion}
                              </p>
                            </div>
                          )}
                          {etapa.pedidos_pendientes_count !== undefined && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Pedidos pendientes:</span>
                              <span className="font-medium">{etapa.pedidos_pendientes_count}</span>
                            </div>
                          )}
                          {etapa.fecha_completitud && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Completado:</span>
                              <span className="font-medium">
                                {format(new Date(etapa.fecha_completitud), "dd MMM yyyy", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Última actualización:</p>
            <p className="font-medium text-foreground">
              {format(new Date(project.updated_at), "dd MMM yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </p>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
