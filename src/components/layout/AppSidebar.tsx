"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
	Home,
	Play,
	Compass,
	Map,
	BarChart2,
	TrendingUp,
	MessageSquare,
	Layers,
	Briefcase,
	Factory,
	Settings,
	HelpCircle,
	ChevronDown,
	Users
} from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel
} from "~/components/ui/sidebar"

import { ModeToggle } from "~/components/ui/mode-toggle"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import { UserSelector } from "./actions/UserSelector"

export function AppSidebar() {
	const pathname = usePathname()

	// Define navigation items
	const mainNavItems = [
		{ href: "/", icon: Home, text: "Dashboard" },
		{ href: "/metro", icon: Play, text: "Metro" },
		{ href: "/destinations", icon: Compass, text: "Destinations" },
		{ href: "/route", icon: Map, text: "Route Plan" },
		{ href: "/comparison", icon: BarChart2, text: "Comparison" },
		{ href: "/growth", icon: TrendingUp, text: "Growth" },
		{ href: "/conversation", icon: MessageSquare, text: "Conversation" },
	]

	const managerNavItems = [
		{ href: "/hr", icon: BarChart2, text: "HR Admin" },
		{ href: "/job-family", icon: Layers, text: "Job Families" },
		{ href: "/competences", icon: Briefcase, text: "Competences" },
		{ href: "/company", icon: Factory, text: "Company" },
	]

	const bottomNavItems = [
		{ href: "/settings", icon: Settings, text: "Settings" },
		{ href: "/help", icon: HelpCircle, text: "Help & Support" },
	]

	return (
		<SidebarProvider defaultOpen={true}>
			<Sidebar className="hidden md:flex">
				<SidebarHeader className="border-b border-border">
					<div className="flex items-center justify-between px-4 py-2">
						<OrganizationSelector />
						<SidebarTrigger />
					</div>
				</SidebarHeader>

				<SidebarContent>
					<ScrollArea className="h-full">
						{/* Main Navigation Group */}
						<SidebarGroup>
							<SidebarGroupLabel>Navigation</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{mainNavItems.map((item) => (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												asChild
												isActive={pathname === item.href}
												tooltip={item.text}
											>
												<Link href={item.href}>
													<item.icon className="h-4 w-4" />
													<span>{item.text}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>

						{/* Manager Options (with Collapsible) */}
						<SidebarGroup>
							<Collapsible className="group/collapsible">
								<SidebarGroupLabel asChild>
									<CollapsibleTrigger className="flex w-full items-center justify-between">
										<span>Management</span>
										<ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
									</CollapsibleTrigger>
								</SidebarGroupLabel>
								<CollapsibleContent>
									<SidebarGroupContent>
										<SidebarMenu>
											{managerNavItems.map((item) => (
												<SidebarMenuItem key={item.href}>
													<SidebarMenuButton
														asChild
														isActive={pathname === item.href}
														tooltip={item.text}
													>
														<Link href={item.href}>
															<item.icon className="h-4 w-4" />
															<span>{item.text}</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroupContent>
								</CollapsibleContent>
							</Collapsible>
						</SidebarGroup>

						{/* Bottom Navigation Group */}
						<SidebarGroup className="mt-auto">
							<SidebarGroupContent>
								<SidebarMenu>
									{bottomNavItems.map((item) => (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												asChild
												isActive={pathname === item.href}
												tooltip={item.text}
											>
												<Link href={item.href}>
													<item.icon className="h-4 w-4" />
													<span>{item.text}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</ScrollArea>
				</SidebarContent>

				<SidebarFooter className="border-t border-border p-4">
					<div className="flex items-center justify-between">
						<UserSelector />
						<ModeToggle />
					</div>
				</SidebarFooter>
			</Sidebar>
		</SidebarProvider>
	)
}