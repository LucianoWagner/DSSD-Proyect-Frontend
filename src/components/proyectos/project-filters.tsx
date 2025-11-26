"use client";

/**
 * Barra de filtros para proyectos
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import type { ProjectListFilters } from "@/types/colaboraciones";

interface ProjectFiltersProps {
  filters: ProjectListFilters;
  onFiltersChange: (filters: ProjectListFilters) => void;
  showEstadoFilter?: boolean;
}

export function ProjectFilters({
  filters,
  onFiltersChange,
  showEstadoFilter = true,
}: ProjectFiltersProps) {
  const handleFilterChange = (key: keyof ProjectListFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" || !value ? undefined : value,
      page: 1, // Reset to page 1 when filters change
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      page_size: filters.page_size,
      my_projects: filters.my_projects,
      exclude_my_projects: filters.exclude_my_projects,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      (showEstadoFilter && filters.estado) ||
      filters.tipo ||
      filters.pais ||
      filters.provincia ||
      filters.ciudad
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <div>
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Buscar proyectos..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Estado */}
        {showEstadoFilter && (
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={filters.estado || "all"}
              onValueChange={(value) => handleFilterChange("estado", value)}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tipo */}
        <div>
          <Label htmlFor="tipo">Tipo de Proyecto</Label>
          <Select
            value={filters.tipo || "all"}
            onValueChange={(value) => handleFilterChange("tipo", value)}
          >
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="infraestructura">Infraestructura</SelectItem>
              <SelectItem value="educacion">Educación</SelectItem>
              <SelectItem value="salud">Salud</SelectItem>
              <SelectItem value="medio_ambiente">Medio Ambiente</SelectItem>
              <SelectItem value="comunitario">Comunitario</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* País */}
        <div>
          <Label htmlFor="pais">País</Label>
          <Select
            value={filters.pais || "all"}
            onValueChange={(value) => handleFilterChange("pais", value)}
          >
            <SelectTrigger id="pais">
              <SelectValue placeholder="Todos los países" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              <SelectItem value="Argentina">Argentina</SelectItem>
              <SelectItem value="Brasil">Brasil</SelectItem>
              <SelectItem value="Chile">Chile</SelectItem>
              <SelectItem value="Uruguay">Uruguay</SelectItem>
              <SelectItem value="Paraguay">Paraguay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Provincia (si país es Argentina) */}
        {filters.pais === "Argentina" && (
          <div>
            <Label htmlFor="provincia">Provincia</Label>
            <Input
              id="provincia"
              type="text"
              placeholder="Ej: Buenos Aires"
              value={filters.provincia || ""}
              onChange={(e) => handleFilterChange("provincia", e.target.value)}
            />
          </div>
        )}

        {/* Ciudad */}
        <div>
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input
            id="ciudad"
            type="text"
            placeholder="Ej: La Plata"
            value={filters.ciudad || ""}
            onChange={(e) => handleFilterChange("ciudad", e.target.value)}
          />
        </div>

        {/* Ordenar por */}
        <div>
          <Label htmlFor="sort">Ordenar por</Label>
          <Select
            value={filters.sort_by || "created_at"}
            onValueChange={(value) =>
              handleFilterChange("sort_by", value as "created_at" | "updated_at" | "titulo")
            }
          >
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Fecha de creación</SelectItem>
              <SelectItem value="updated_at">Última actualización</SelectItem>
              <SelectItem value="titulo">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
