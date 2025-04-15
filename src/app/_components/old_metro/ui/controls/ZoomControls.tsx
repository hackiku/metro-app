// src/app/_components/metro/controls/ZoomControls.tsx
"use client"

import { ZoomIn, ZoomOut, Home } from "lucide-react"
import { Button } from "~/components/ui/button"

interface ZoomControlsProps {
	onZoomIn: () => void
	onZoomOut: () => void
	onReset: () => void
	zoom: number
	className?: string
}

export function ZoomControls({
	onZoomIn,
	onZoomOut,
	onReset,
	zoom,
	className = ""
}: ZoomControlsProps) {
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<Button
				variant="outline"
				size="icon"
				onClick={onZoomIn}
				className="bg-background/80 backdrop-blur-sm shadow-sm"
			>
				<ZoomIn className="h-4 w-4" />
				<span className="sr-only">Zoom In</span>
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={onReset}
				className="bg-background/80 backdrop-blur-sm shadow-sm"
			>
				<Home className="h-4 w-4" />
				<span className="sr-only">Reset View</span>
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={onZoomOut}
				className="bg-background/80 backdrop-blur-sm shadow-sm"
			>
				<ZoomOut className="h-4 w-4" />
				<span className="sr-only">Zoom Out</span>
			</Button>

			<div className="text-xs text-center text-muted-foreground">
				{Math.round(zoom * 100)}%
			</div>
		</div>
	)
}