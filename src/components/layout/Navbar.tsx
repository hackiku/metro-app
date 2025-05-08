// ~/app/_components/layout/Navbar.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bell } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { OrganizationSelector } from "./actions/OrganizationSelector"
import { UserSelector } from "./actions/UserSelector"
import { PlayButton } from "./actions/PlayButton"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { cn } from "~/lib/utils"

export function Navbar() {
	const [searchExpanded, setSearchExpanded] = useState(false);
	const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);

	return (
		<nav className="flex h-16 items-center justify-between px-4 md:px-8 md:-ml-4">
			<div className="flex items-center gap-4">
				{/* Organization selector */}
				<OrganizationSelector />

				{/* Play/Metro button from component */}
				<div className="hidden md:block">
					<PlayButton />
				</div>
			</div>

			<div className="flex items-center space-x-4">
				{/* Desktop search - expands horizontally */}
				<div className={cn(
					"relative hidden md:flex items-center transition-all duration-300",
					searchExpanded ? "w-64" : "w-10"
				)}>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"absolute left-0 z-10 text-muted-foreground rounded-full",
							searchExpanded ? "hover:bg-transparent" : ""
						)}
						onClick={() => setSearchExpanded(!searchExpanded)}
					>
						<Search className="h-5 w-5" />
						<span className="sr-only">Search</span>
					</Button>
					<Input
						type="text"
						placeholder="Search..."
						className={cn(
							"h-10 bg-muted/30 border-0 focus-visible:ring-1 rounded-lg transition-all",
							searchExpanded ? "pl-10 opacity-100 w-full" : "w-0 opacity-0 p-0"
						)}
						onBlur={() => {
							// Only collapse if the input is empty
							const input = document.activeElement as HTMLInputElement;
							if (!input.value) {
								setSearchExpanded(false);
							}
						}}
					/>
				</div>

				{/* Mobile search - expands vertically */}
				<div className="relative md:hidden">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
						aria-label="Search"
						onClick={() => setMobileSearchExpanded(!mobileSearchExpanded)}
					>
						<Search className="h-5 w-5" />
					</Button>

					{/* Mobile search input - appears below navbar */}
					{mobileSearchExpanded && (
						<div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-[300px] bg-background/95 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border/30 z-50">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Search..."
									className="pl-9 h-10 w-full bg-muted/30 border-0 focus-visible:ring-1"
									autoFocus
									onBlur={() => setMobileSearchExpanded(false)}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Notifications */}
				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground rounded-full hidden sm:flex"
					asChild
				>
					<Link href="https://preview--career-compass-thierry.lovable.app/" target="blank">
						<Bell className="h-5 w-5" />
						<span className="sr-only">Notifications</span>
					</Link>
				</Button>

				{/* Dark mode toggle - simplified style */}
				<ModeToggle />

				{/* User selector - always visible */}
				<UserSelector />
			</div>
		</nav>
	)
}