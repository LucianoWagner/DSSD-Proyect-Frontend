"use client";
import React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { NavMain } from "./sidebar-nav-main";
import { NavUser } from "./sidebar-nav-user";
import { SIDEBAR_ITEMS, type NavItem } from "@/consts/sidebar/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/types/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();

	const isVisibleForRole = (allowedRoles: Role[] | undefined, userRole?: Role) => {
		if (!allowedRoles || allowedRoles.length === 0) return Boolean(userRole);
		if (!userRole) return false;
		return allowedRoles.includes(userRole);
	};

	// Filter navigation items (and subitems) based on user role
	const filterNavItemsByRole = (items: NavItem[], userRole?: Role): NavItem[] => {
		if (!userRole) return [];

		return items
			.map((item) => {
				if (!isVisibleForRole(item.roles, userRole)) return null;

				if (item.items) {
					const filteredSubItems = item.items.filter((subItem) =>
						isVisibleForRole(subItem.roles, userRole)
					);

					if (filteredSubItems.length === 0) return null;

					return { ...item, items: filteredSubItems };
				}

				return item;
			})
			.filter(Boolean) as NavItem[];
	};

	const filteredNavItems = filterNavItemsByRole(SIDEBAR_ITEMS.navMain, user?.role);

	const userData = user
		? {
				name: `${user.nombre} ${user.apellido}`,
				email: user.email,
				avatar: "/avatars/default.jpg",
		  }
		: {
				name: "Usuario",
				email: "usuario@example.com",
				avatar: "/avatars/default.jpg",
		  };

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="#">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">
									Project Planning.
								</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={filteredNavItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
