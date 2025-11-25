import {
	FolderOpen,
	FolderPlus,
	HandHeart,
	LayoutDashboard,
	TrendingUp,
	BarChart3,
	FileText,
	Search,
	Heart,
	PlusCircle,
	type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavSubItem {
	title: string;
	url: string;
	icon: LucideIcon;
	badge?: string;
	roles?: Role[];
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
			title: "Mis Proyectos",
			icon: FolderOpen,
			roles: ["MEMBER"], // Only MEMBER can create/manage projects
			items: [
				{
					title: "Ver Todos",
					url: "/proyectos",
					icon: FolderOpen,
				},
				{
					title: "Crear Proyecto",
					url: "/proyectos/nuevo",
					icon: FolderPlus,
				},
				{
					title: "Ofertas Recibidas",
					url: "/proyectos/ofertas",
					icon: HandHeart,
				},
			],
		},
		{
			title: "Colaborar",
			icon: HandHeart,
			roles: ["MEMBER"], // Only MEMBER can collaborate
			items: [
				{
					title: "Explorar Proyectos",
					url: "/colaboraciones",
					icon: Search,
				},
				{
					title: "Mis Ofertas Enviadas",
					url: "/colaboraciones/compromisos",
					icon: Heart,
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
					title: "Proyectos (métricas)",
					url: "/metricas/proyectos",
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
			roles: ["COUNCIL", "MEMBER"], // COUNCIL creates, MEMBER resolves
			items: [
				{
					title: "Observaciones Enviadas",
					url: "/observaciones",
					icon: FileText,
					roles: ["COUNCIL"],
				},
				{
					title: "Observaciones Recibidas",
					url: "/observaciones",
					icon: FileText,
					roles: ["MEMBER"],
				},
				{
					title: "Crear Nueva Observación",
					url: "/observaciones/crear",
					icon: PlusCircle,
					roles: ["COUNCIL"],
				},
			],
		},
	] as NavItem[],
};
