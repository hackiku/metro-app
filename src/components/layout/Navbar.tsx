// ~/app/_components/layout/Navbar.tsx

"use client"

import Link from "next/link"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { Search, Bell, Play } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import { UserSelector } from "./actions/UserSelector"
import { cn } from "~/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"

export function Navbar() {
	return (
		<nav className="flex h-16 items-center justify-between px-6 __bg-neutral-100/50 dark:bg-background">
			<div className="flex items-center gap-3">
				<OrganizationSelector />

				{/* Metro button - moved from sidebar */}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-primary rounded-full h-10 w-10"
								asChild
							>
								<Link href="/metro">
									<Play className="h-5 w-5 ml-0.5" />
									<span className="sr-only">Metro</span>
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							Metro
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<div className="flex items-center space-x-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search..."
						className="h-10 w-64 pl-10 bg-muted/30 border-0 focus-visible:ring-1"
					/>
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground rounded-full"
					asChild
				>
					<Link href="https://preview--career-compass-thierry.lovable.app/" target="blank">
						<Bell className="h-5 w-5" />
						<span className="sr-only">Notifications</span>
					</Link>
				</Button>

				<ModeToggle />

				<UserSelector />
			</div>
		</nav>
	)
}