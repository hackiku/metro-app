// src/components/layout/MobileNavbar.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	Menu,
	Search,
	Bell,
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
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { UserSelector } from "./actions/UserSelector"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from "~/components/ui/collapsible"
import { cn } from "~/lib/utils"

export function MobileNavbar() {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const [managerMenuOpen, setManagerMenuOpen] = useState(false)

	// Define navigation items - same structure as in AppSidebar
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
		<nav className="flex h-16 items-center justify-between border-b border-border px-4 md:hidden">
			<div className="flex items-center gap-3">
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="md:hidden">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
						<div className="flex flex-col h-full">
							<div className="border-b border-border p-4">
								<OrganizationSelector />
							</div>

							<div className="flex-1 overflow-auto py-2">
								{/* Main Navigation */}
								<div className="px-3 py-2">
									<h3 className="mb-2 px-4 text-xs font-medium text-muted-foreground">Navigation</h3>
									<div className="space-y-1">
										{mainNavItems.map((item) => (
											<NavItem
												key={item.href}
												href={item.href}
												icon={<item.icon className="mr-2 h-4 w-4" />}
												active={pathname === item.href}
											>
												{item.text}
											</NavItem>
										))}
									</div>
								</div>

								{/* Management Section with Collapsible */}
								<div className="px-3 py-2">
									<Collapsible
										open={managerMenuOpen}
										onOpenChange={setManagerMenuOpen}
										className="w-full"
									>
										<CollapsibleTrigger asChild>
											<button className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent">
												<span>Management</span>
												<ChevronDown className={cn(
													"h-4 w-4 transition-transform",
													managerMenuOpen && "rotate-180"
												)} />
											</button>
										</CollapsibleTrigger>
										<CollapsibleContent className="space-y-1">
											{managerNavItems.map((item) => (
												<NavItem
													key={item.href}
													href={item.href}
													icon={<item.icon className="mr-2 h-4 w-4" />}
													active={pathname === item.href}
													className="pl-6"
												>
													{item.text}
												</NavItem>
											))}
										</CollapsibleContent>
									</Collapsible>
								</div>

								{/* Bottom Navigation */}
								<div className="mt-6 px-3 py-2">
									<h3 className="mb-2 px-4 text-xs font-medium text-muted-foreground">Support</h3>
									<div className="space-y-1">
										{bottomNavItems.map((item) => (
											<NavItem
												key={item.href}
												href={item.href}
												icon={<item.icon className="mr-2 h-4 w-4" />}
												active={pathname === item.href}
											>
												{item.text}
											</NavItem>
										))}
									</div>
								</div>
							</div>

							<div className="border-t border-border p-4">
								<UserSelector />
							</div>
						</div>
					</SheetContent>
				</Sheet>

				<Link href="/" className="flex items-center gap-2 font-semibold">
					Career Compass
				</Link>
			</div>

			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" className="text-muted-foreground">
					<Search className="h-5 w-5" />
					<span className="sr-only">Search</span>
				</Button>

				<Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
					<Link href="https://preview--career-compass-thierry.lovable.app/" target="blank">
						<Bell className="h-5 w-5" />
						<span className="sr-only">Notifications</span>
					</Link>
				</Button>

				<ModeToggle />
			</div>
		</nav>
	)
}

interface NavItemProps {
	href: string
	icon?: React.ReactNode
	children: React.ReactNode
	active?: boolean
	className?: string
}

function NavItem({ href, icon, children, active, className }: NavItemProps) {
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
				active ? "bg-accent text-accent-foreground" : "transparent",
				className
			)}
		>
			{icon}
			{children}
		</Link>
	)
}