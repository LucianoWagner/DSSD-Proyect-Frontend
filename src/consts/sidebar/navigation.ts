import {
	Bell,
	Calendar,
	CheckCircle2,
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
	AlertTriangle,
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
			title: "Seguimiento",
			icon: TrendingUp,
			roles: ["MEMBER"], // Only MEMBER tracks their projects
			items: [
				{
					title: "Proyectos en Curso",
					url: "/seguimiento/proyectos",
					icon: Eye,
				},
				{
					title: "Control Quincenal",
					url: "/seguimiento/control",
					icon: Calendar,
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
			roles: ["COUNCIL", "MEMBER"], // COUNCIL creates, MEMBER resolves
			items: [
				{
					title: "Panel Principal",
					url: "/observaciones",
					icon: FileText,
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
