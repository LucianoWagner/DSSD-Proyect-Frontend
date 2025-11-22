"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "../ui/badge";

type NavItem = {
	title: string;
	url?: string;
	icon?: LucideIcon;
	isActive?: boolean;
	badge?: string;
	items?: {
		title: string;
		url: string;
		icon?: LucideIcon;
		badge?: string;
	}[];
};
export function NavMain({ items }: { items: NavItem[] }) {
	const pathname = usePathname();
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Principal</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					// Si el item no tiene subitems, renderizar como item simple
					if (!item.items) {
						const isActive = pathname === item.url;

						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									isActive={isActive}
								>
									<Link href={item.url || "#"}>
										{item.icon && (
											<item.icon className="size-4" />
										)}
										<span>{item.title}</span>
										{item.badge && (
											<Badge
												variant="secondary"
												className="ml-auto"
											>
												{item.badge}
											</Badge>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					}

					// Para items con subitems, usar Collapsible
					const hasActiveSubItem = item.items.some(
						(subItem) => pathname === subItem.url
					);
					const shouldBeOpen = hasActiveSubItem || item.isActive;

					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={shouldBeOpen}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										tooltip={item.title}
										isActive={hasActiveSubItem}
									>
										{item.icon && (
											<item.icon className="size-4" />
										)}
										<span>{item.title}</span>
										{item.badge && (
											<Badge
												variant="secondary"
												className="ml-auto mr-2"
											>
												{item.badge}
											</Badge>
										)}
										<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 size-4" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items.map((subItem) => {
											const isSubItemActive =
												pathname === subItem.url;

											return (
												<SidebarMenuSubItem
													key={subItem.title}
												>
													<SidebarMenuSubButton
														asChild
														isActive={
															isSubItemActive
														}
													>
														<Link
															href={subItem.url}
														>
															{subItem.icon && (
																<subItem.icon className="size-4" />
															)}
															<span>
																{subItem.title}
															</span>
															{subItem.badge && (
																<Badge
																	variant={
																		isSubItemActive
																			? "default"
																			: "secondary"
																	}
																	className="ml-auto"
																>
																	{
																		subItem.badge
																	}
																</Badge>
															)}
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											);
										})}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
