// src/app/_components/metro/player/Avatar.tsx
"use client"

import { useState } from "react"
// import { Award } from "lucide-react"
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

interface AvatarProps {
	src?: string
	name?: string
	level?: number
	isExpanded: boolean
	onClick: () => void
	className?: string
}

export function Avatar({
	src,
	name = "User",
	level = 1,
	isExpanded,
	onClick,
	className
}: AvatarProps) {
	const initial = name ? name.charAt(0) : "U"

	// When collapsed, show a standalone avatar with level indicator
	if (!isExpanded) {
		return (
			<Button
				variant="outline"
				size="icon"
				className={cn(
					"group relative h-14 w-14 rounded-full bg-background/90 p-0 shadow-md backdrop-blur-sm hover:shadow-lg transition-all duration-300",
					className
				)}
				onClick={onClick}
			>
				<ShadcnAvatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
					<AvatarImage src={src} alt={name} />
					<AvatarFallback>{initial}</AvatarFallback>
				</ShadcnAvatar>

				{/* Level indicator */}
				<div className="absolute -top-1 -right-1 rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs font-medium shadow-sm">
					{level}
				</div>
			</Button>
		)
	}

	// When expanded, show a larger avatar for the header section
	return (
		<div className={cn("relative", className)}>
			<ShadcnAvatar className="h-14 w-14 border-2 border-primary/20">
				<AvatarImage src={src} alt={name} />
				<AvatarFallback>{initial}</AvatarFallback>
			</ShadcnAvatar>

			{/* Level indicator for expanded view */}
			<div className="absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs font-medium shadow-sm">
				{level}
			</div>
		</div>
	)
}