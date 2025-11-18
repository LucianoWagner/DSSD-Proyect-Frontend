import {
	Bell,
	Calendar,
	CheckCircle2,
	Clock,
	Clock3,
	Eye,
	FolderOpen,
	FolderPlus,
	HandHeart,
	LayoutDashboard,
	Target,
	TrendingUp,
	Workflow,
	BarChart3,
	FileText,
	Shield,
	Search,
	Heart,
	type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavSubItem {
	title: string;
	url: string;
	icon: LucideIcon;
	badge?: string;
}

export interface NavItem {
	title: string;
	url?: string;
	icon: LucideIcon;
	badge?: string;
	items?: NavSubItem[];
	roles?: Role[]; // If undefined, visible to all roles
}

// MEMBER (ONGs) - Can collaborate, create projects, manage their projects
// COUNCIL (Directivos) - Can view metrics, make observations, review all projects

export const SIDEBAR_ITEMS = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboard,
			// Visible to all roles
		},
		{
			title: "Proyectos",
			icon: FolderOpen,
			roles: ["MEMBER"], // Only MEMBER can create/manage projects
			items: [
				{
					title: "Todos los Proyectos",
					url: "/proyectos",
					icon: FolderOpen,
				},
				{
					title: "Ofertas Recibidas",
					url: "/proyectos/ofertas",
					icon: HandHeart,
				},
				{
					title: "Nuevo proyecto",
					url: "/proyectos/nuevo",
					icon: FolderPlus,
				},
				{
					title: "En Planificacion",
					url: "/proyectos/planificacion",
					icon: Clock3,
					badge: "12",
				},
				{
					title: "En Ejecucion",
					url: "/proyectos/ejecucion",
					icon: Workflow,
					badge: "8",
				},
			],
		},
		{
			title: "Colaboraciones",
			icon: HandHeart,
			roles: ["MEMBER"], // Only MEMBER can collaborate
			items: [
				{
					title: "Explorar Proyectos",
					url: "/colaboraciones",
					icon: Search,
					// badge: "12", // Optional: count de proyectos disponibles
				},
				{
					title: "Mis Compromisos",
					url: "/colaboraciones/compromisos",
					icon: Heart,
					// badge: "3", // Optional: count de compromisos activos
				},
				{
					title: "Pedidos Activos",
					url: "/pedidos",
					icon: Target,
					badge: "5",
				},
				{
					title: "Notificaciones",
					url: "/notificaciones",
					icon: Bell,
					badge: "3",
				},
			],
		},
		{
			title: "Seguimiento",
			icon: Eye,
			roles: ["MEMBER"], // Only MEMBER tracks their projects
			items: [
				{
					title: "Proyectos en Curso",
					url: "/seguimiento/proyectos",
					icon: TrendingUp,
				},
				{
					title: "Control Quincenal",
					url: "/seguimiento/control",
					icon: Calendar,
					badge: "2",
				},
				{
					title: "Cronograma",
					url: "/seguimiento/cronograma",
					icon: Clock,
				},
			],
		},
		{
			title: "Métricas",
			icon: BarChart3,
			roles: ["COUNCIL"], // Only COUNCIL can view metrics
			items: [
				{
					title: "Resumen General",
					url: "/metricas/resumen",
					icon: BarChart3,
				},
				{
					title: "Proyectos por ONG",
					url: "/metricas/por-ong",
					icon: TrendingUp,
				},
				{
					title: "Reportes",
					url: "/metricas/reportes",
					icon: FileText,
				},
			],
		},
		{
			title: "Observaciones",
			icon: FileText,
			roles: ["COUNCIL"], // Only COUNCIL can make observations
			items: [
				{
					title: "Todas las Observaciones",
					url: "/observaciones",
					icon: FileText,
				},
				{
					title: "Pendientes de Revisión",
					url: "/observaciones/pendientes",
					icon: Clock,
					badge: "7",
				},
			],
		},
		{
			title: "Revisión de Proyectos",
			icon: Shield,
			roles: ["COUNCIL"], // Only COUNCIL can review all projects
			items: [
				{
					title: "Todos los Proyectos",
					url: "/revision/proyectos",
					icon: FolderOpen,
				},
				{
					title: "Aprobaciones Pendientes",
					url: "/revision/aprobaciones",
					icon: CheckCircle2,
					badge: "4",
				},
			],
		},
	] as NavItem[],
};
