// src/app/_components/metro/controls/ZoomControls.tsx
"use client"

import { Home } from "lucide-react"
import { Button } from "~/components/ui/button"

interface ZoomControlsProps {
	onReset: () => void
	zoomLevel?: number
	className?: string
}

export default function ZoomControls({
	onReset,
	zoomLevel,
	className = ""
}: ZoomControlsProps) {
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<Button
				variant="outline"
				size="icon"
				onClick={onReset}
				className="bg-background/80 backdrop-blur-sm shadow-sm"
				title="Reset View"
			>
				<Home className="h-4 w-4" />
				<span className="sr-only">Reset View</span>
			</Button>

			{zoomLevel && (
				<div className="text-xs text-center text-muted-foreground">
					{Math.round(zoomLevel * 100)}%
				</div>
			)}
		</div>
	)
}