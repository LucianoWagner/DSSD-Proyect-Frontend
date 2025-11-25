"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { observacionCreateSchema, type ObservacionCreateFormValues } from "@/schemas/observacion";
import { useCreateObservacion } from "@/hooks/observaciones/use-create-observacion";
import { useListProjectsForObservations } from "@/hooks/use-list-projects-for-observations";
import { useGetProjectDetail } from "@/hooks/colaboraciones/use-get-project-detail";
import { getErrorMessage } from "@/lib/api-error";
import { ProjectDetailsPanel } from "./project-details-panel";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  Form,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_DESCRIPTION_LENGTH = 10;

export function CreateObservacionForm() {
  const router = useRouter();
  const [createdObservacion, setCreatedObservacion] = useState<{ id: string; proyecto_id: string } | null>(null);

  // Fetch projects in en_ejecucion state
  const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useListProjectsForObservations({
    page: 1,
    page_size: 100,
  });

  // Create observacion mutation - called at top level
  const createObservacionMutation = useCreateObservacion();

  // Form setup
  const form = useForm<ObservacionCreateFormValues>({
    resolver: zodResolver(observacionCreateSchema),
    defaultValues: {
      proyecto_id: "",
      descripcion: "",
    },
    mode: "onChange",
  });

  const descriptionLength = form.watch("descripcion")?.length || 0;
  const selectedProjectId = form.watch("proyecto_id");

  // Fetch detailed project info when selected
  const { data: projectDetail, isLoading: isLoadingProjectDetail } = useGetProjectDetail(
    selectedProjectId || null
  );

  // Find selected project to show details
  const selectedProject = projectsData?.items.find((p) => p.id === selectedProjectId);

  const onSubmit = async (data: ObservacionCreateFormValues) => {
    try {
      const result = await createObservacionMutation.mutateAsync({
        proyecto_id: data.proyecto_id,
        descripcion: data.descripcion,
      });

      // Show success toast
      toast.success("¡Observación creada exitosamente!", {
        description: `Tu observación ha sido registrada y se ha iniciado el proceso de seguimiento.`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        duration: 5000,
      });

      // Store observacion info for success state
      setCreatedObservacion({
        id: result.id,
        proyecto_id: result.proyecto_id,
      });

      // Reset form
      form.reset();
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      // Show error toast
      toast.error("Error al crear la observación", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 6000,
      });

      console.error("Error al crear observación:", error);
    }
  };

  // Success state
  if (createdObservacion) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">¡Observación Creada!</CardTitle>
          <CardDescription className="text-green-800">
            Tu observación ha sido registrada exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">
              Proyecto: <span className="font-semibold text-gray-900">{selectedProject?.titulo}</span>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              La observación ha sido enviada al proyecto y se ha iniciado el proceso de seguimiento automático.
              El consejo será notificado cuando se resuelva.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setCreatedObservacion(null);
                form.reset();
              }}
              variant="outline"
              className="flex-1"
            >
              Crear otra observación
            </Button>
            <Button
              onClick={() => router.push("/observaciones")}
              className="flex-1"
            >
              Ver todas mis observaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Left Column: Form (30%) */}
      <Card className="lg:flex-[3] lg:min-w-0">
        <CardHeader>
          <CardTitle>Crear Nueva Observación</CardTitle>
          <CardDescription>
            Registra una observación sobre un proyecto en ejecución. El proyecto tendrá 5 días para responder.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {projectsError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al cargar proyectos</AlertTitle>
              <AlertDescription>
                No se pudieron cargar los proyectos. Por favor, intenta nuevamente.
              </AlertDescription>
            </Alert>
          )}

          {isLoadingProjects && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertTitle className="text-blue-900">Cargando proyectos</AlertTitle>
              <AlertDescription className="text-blue-800">
                Por favor espera mientras cargamos los proyectos disponibles...
              </AlertDescription>
            </Alert>
          )}

          {!isLoadingProjects && !projectsError && projectsData?.items.length === 0 && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Sin proyectos disponibles</AlertTitle>
              <AlertDescription className="text-amber-800">
                No hay proyectos en ejecución en este momento. Por favor intenta más tarde.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Selector */}
            <FormField
              control={form.control}
              name="proyecto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecciona un Proyecto *</FormLabel>
                  <FormDescription>
                    Solo puedes crear observaciones en proyectos en ejecución
                  </FormDescription>

                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingProjects}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proyecto..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectsData?.items.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{project.titulo}</span>
                            <span className="text-xs text-gray-500">
                              {project.ciudad && `${project.ciudad}, `}
                              {project.pais}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Project Info */}
            {selectedProject && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Proyecto seleccionado</AlertTitle>
                <AlertDescription className="text-blue-800">
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-semibold">{selectedProject.titulo}</span>
                    </p>
                    {selectedProject.ciudad && (
                      <p className="text-sm">
                        Ubicación: {selectedProject.ciudad}, {selectedProject.pais}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Description Field */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la Observación *</FormLabel>
                  <FormDescription>
                    Detalla tu observación de manera clara y constructiva (mínimo {MIN_DESCRIPTION_LENGTH} caracteres)
                  </FormDescription>

                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Describe la observación sobre el proyecto. Sé específico y constructivo..."
                        className="min-h-40 resize-none pr-12"
                        {...field}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                      />
                      <div className="absolute right-3 bottom-3 text-xs font-medium text-gray-500">
                        {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                      </div>
                    </div>
                  </FormControl>

                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          descriptionLength < MIN_DESCRIPTION_LENGTH
                            ? "bg-red-500"
                            : "bg-green-500"
                        )}
                        style={{
                          width: `${(descriptionLength / MAX_DESCRIPTION_LENGTH) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.reset()}
                disabled={createObservacionMutation.isPending}
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  createObservacionMutation.isPending ||
                  !form.formState.isValid ||
                  !selectedProjectId ||
                  isLoadingProjects
                }
              >
                {createObservacionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createObservacionMutation.isPending ? "Creando..." : "Crear Observación"}
              </Button>
            </div>

            {/* Help text */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Información importante</AlertTitle>
              <AlertDescription className="text-amber-800">
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• El proyecto tendrá 5 días para responder tu observación</li>
                  <li>• Se notificará automáticamente al proyecto responsable</li>
                  <li>• Puedes ver el estado de todas tus observaciones en el panel principal</li>
                </ul>
              </AlertDescription>
            </Alert>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Right Column: Project Details Panel (70%) */}
      <div className="hidden lg:block lg:flex-[7] lg:min-w-0">
        <ProjectDetailsPanel
          project={projectDetail}
          isLoading={isLoadingProjectDetail}
          showEmpty={!selectedProjectId}
        />
      </div>
    </div>
  );
}
