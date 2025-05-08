"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Users, BarChart, Settings } from "lucide-react"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import { UserSelector } from "./actions/UserSelector"
import { ModeToggle } from "~/components/ui/mode-toggle"
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
} from "~/components/ui/sidebar"

export function AppSidebar() {
	const pathname = usePathname()

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
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Dashboard">
								<Link href="/">
									<Home className="h-4 w-4" />
									<span>Dashboard</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={pathname === "/users"} tooltip="Users">
								<Link href="/users">
									<Users className="h-4 w-4" />
									<span>Users</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={pathname === "/analytics"} tooltip="Analytics">
								<Link href="/analytics">
									<BarChart className="h-4 w-4" />
									<span>Analytics</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="Settings">
								<Link href="/settings">
									<Settings className="h-4 w-4" />
									<span>Settings</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
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
