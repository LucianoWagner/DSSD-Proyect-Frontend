# ProjectPlanning Frontend 🌐

Este es el frontend del sistema de Planificación de Proyectos, una aplicación moderna construida con **Next.js 15 (App Router)** para ofrecer una experiencia de usuario rápida, accesible y robusta.

## 📌 Visión General

La plataforma sirve como interfaz centralizada para ONGs, administradores y revisores. Permite la gestión integral de proyectos, desde su propuesta inicial hasta el seguimiento detallado de financiamiento y ejecución de pedidos.

### Características Clave:
-   **Dashboard de Control**: Visualización de métricas y estados de proyectos en tiempo real.
-   **Gestión de Ofertas**: Interfaz para crear y aceptar ofertas sobre pedidos específicos.
-   **Seguimiento de Etapas**: Monitoreo visual del progreso de los proyectos y su financiamiento.
-   **Arquitectura Server-First**: Aprovecha los React Server Components para un rendimiento óptimo.

## 🛠️ Stack Tecnológico

-   **Framework:** Next.js 15 (App Router)
-   **Lenguaje:** TypeScript (Type-safe estricto)
-   **Estilos:** Tailwind CSS + shadcn/ui
-   **Iconografía:** Lucide React
-   **Formularios:** React Hook Form + Zod
-   **Gestor de Paquetes:** `pnpm`

## 🏗️ Integración

El frontend está diseñado para comunicarse **únicamente** con la **Proxy API**. Esta arquitectura desacoplada permite que el frontend se mantenga enfocado en la experiencia de usuario, mientras que la lógica de procesos de negocio (Bonita BPM) y la persistencia (Cloud API) son manejadas por la capa de backend.

## 🚦 Inicio Rápido

1.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` basado en `.env.template` con la URL de la Proxy API.

3.  **Ejecutar en desarrollo:**
    ```bash
    pnpm dev
    ```

## 📂 Documentación Adicional

Para más detalles técnicos, consulta:
-   🤖 **[Frontend Guidelines](AGENTS.md)**: Reglas, arquitectura y convenciones de código.
-   🔌 **[API Documentation](API_DOCUMENTATION.md)**: Referencia de los contratos con la Proxy API.

---
*Este proyecto fue desarrollado como parte de un trabajo grupal para la materia DSSD.*
