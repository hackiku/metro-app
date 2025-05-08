// src/components/layout/MobileNavbar.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	Menu,
	Search,
	Home,
	Compass,
	Map,
	BarChart2,
	TrendingUp,
	MessageSquare,
	Layers,
	Briefcase,
	Factory,
	Settings,
	ChevronDown,
	X
} from "lucide-react"
import { Button } from "~/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
	SheetHeader,
	SheetTitle
} from "~/components/ui/sheet"
import { UserSelector } from "./actions/UserSelector"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import { PlayButton } from "./actions/PlayButton"
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

	// Define navigation items - same structure as in Sidebar
	const mainNavItems = [
		{ href: "/", icon: Home, text: "Dashboard" },
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
	]

	return (
		<nav className="md:hidden flex h-16 items-center justify-between px-4">
			<div className="flex items-center gap-3">
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<div className="relative">
							{/* Base of 3D button */}
							<div className="absolute inset-0 rounded-md bg-muted/20" />

							<Button
								variant="ghost"
								size="icon"
								className="relative rounded-md h-9 w-9 bg-background text-muted-foreground/50 border border-muted-foreground/10 hover:text-muted-foreground/70 hover:translate-y-[1px] transition-all shadow-sm"
							>
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</div>
					</SheetTrigger>
					<SheetContent side="left" className="w-[85%] max-w-[300px] p-0 border-0">
						<SheetHeader className="sr-only">
							<SheetTitle>Navigation Menu</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col h-full bg-background">
							<div className="p-4 flex items-center justify-between">
								<OrganizationSelector />
								<SheetClose asChild>
									<div className="relative">
										<div className="absolute inset-0 rounded-md bg-muted/20" />
										<Button
											variant="ghost"
											size="icon"
											className="relative rounded-md h-9 w-9 bg-background text-muted-foreground/50 border border-muted-foreground/10 hover:text-muted-foreground/70 hover:translate-y-[1px] transition-all shadow-sm"
										>
											<X className="h-5 w-5" />
										</Button>
									</div>
								</SheetClose>
							</div>

							<div className="flex-1 overflow-auto pt-2 pb-4 px-4">
								{/* Main Navigation */}
								<div className="space-y-1 mb-6">
									{mainNavItems.map((item) => (
										<NavItem
											key={item.href}
											href={item.href}
											icon={<item.icon className="mr-2 h-4 w-4" />}
											active={pathname === item.href}
											onClick={() => setOpen(false)}
										>
											{item.text}
										</NavItem>
									))}
								</div>

								{/* Management Section with Collapsible */}
								<div className="mb-6">
									<Collapsible
										open={managerMenuOpen}
										onOpenChange={setManagerMenuOpen}
										className="w-full"
									>
										<CollapsibleTrigger className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-normal uppercase tracking-wider text-muted-foreground/70 hover:text-foreground hover:bg-muted/40">
											<span>admin</span>
											<ChevronDown className={cn(
												"ml-auto h-4 w-4 transition-transform",
												managerMenuOpen && "rotate-180"
											)} />
										</CollapsibleTrigger>
										<CollapsibleContent className="space-y-1 pt-1">
											{managerNavItems.map((item) => (
												<NavItem
													key={item.href}
													href={item.href}
													icon={<item.icon className="mr-2 h-4 w-4" />}
													active={pathname === item.href}
													className="pl-6"
													onClick={() => setOpen(false)}
												>
													{item.text}
												</NavItem>
											))}
										</CollapsibleContent>
									</Collapsible>
								</div>

								{/* Bottom Navigation */}
								<div className="mt-auto space-y-1">
									{bottomNavItems.map((item) => (
										<NavItem
											key={item.href}
											href={item.href}
											icon={<item.icon className="mr-2 h-4 w-4" />}
											active={pathname === item.href}
											onClick={() => setOpen(false)}
										>
											{item.text}
										</NavItem>
									))}
								</div>
							</div>

							<div className="p-4 flex justify-center">
								<UserSelector />
							</div>
						</div>
					</SheetContent>
				</Sheet>

				<Link href="/" className="flex items-center gap-2 font-semibold">
					Career Compass
				</Link>
			</div>

			<div className="flex items-center gap-4">
				{/* Search button */}
				<div className="relative">
					<div className="absolute inset-0 rounded-md bg-muted/20" />
					<Button
						variant="ghost"
						size="icon"
						className="relative rounded-md h-9 w-9 bg-background text-muted-foreground/50 border border-muted-foreground/10 hover:text-muted-foreground/70 hover:translate-y-[1px] transition-all shadow-sm"
						aria-label="Search"
					>
						<Search className="h-5 w-5" />
					</Button>
				</div>

				{/* Play button */}
				<PlayButton variant="mini" />

				{/* User selector */}
				<div className="flex justify-center">
					<UserSelector />
				</div>
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
	onClick?: () => void
}

function NavItem({ href, icon, children, active, className, onClick }: NavItemProps) {
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
				active
					? "bg-primary/15 text-primary"
					: "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
				className
			)}
			onClick={onClick}
		>
			{icon}
			{children}
		</Link>
	)
}