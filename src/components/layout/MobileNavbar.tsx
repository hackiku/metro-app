// src/components/layout/MobileNavbar.tsx

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, Bell, Home, Users, BarChart, Settings } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { UserSelector } from "./actions/UserSelector"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import { cn } from "~/lib/utils"

export function MobileNavbar() {
	const [open, setOpen] = useState(false)

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
								<div className="px-3 py-2">
									<h3 className="mb-2 px-4 text-xs font-medium text-muted-foreground">Navigation</h3>
									<div className="space-y-1">
										<NavItem href="/" icon={<Home className="mr-2 h-4 w-4" />}>
											Dashboard
										</NavItem>
										<NavItem href="/users" icon={<Users className="mr-2 h-4 w-4" />}>
											Users
										</NavItem>
										<NavItem href="/analytics" icon={<BarChart className="mr-2 h-4 w-4" />}>
											Analytics
										</NavItem>
										<NavItem href="/settings" icon={<Settings className="mr-2 h-4 w-4" />}>
											Settings
										</NavItem>
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
}

function NavItem({ href, icon, children, active }: NavItemProps) {
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
				active ? "bg-accent text-accent-foreground" : "transparent",
			)}
		>
			{icon}
			{children}
		</Link>
	)
}
