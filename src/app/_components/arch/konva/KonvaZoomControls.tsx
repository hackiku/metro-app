// src/app/_components/metro/konva/KonvaZoomControls.tsx
"use client";

import React from 'react';
import { Button } from '~/components/ui/button';
import { Grid, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip';
import { useMetroMap } from '~/contexts/MetroMapContext';

interface KonvaZoomControlsProps {
	className?: string;
}

export default function KonvaZoomControls({
	className = ""
}: KonvaZoomControlsProps) {
	const {
		zoomIn,
		zoomOut,
		resetView,
		showGrid,
		toggleGrid,
		viewport,
	} = useMetroMap();

	// Display zoom percentage
	const currentZoom = Math.round(viewport.scale * 100);

	return (
		<TooltipProvider>
			<div className={`flex flex-col gap-2 ${className}`}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
							onClick={toggleGrid}
						>
							<Grid className={`h-4 w-4 ${showGrid ? 'text-primary' : ''}`} />
							<span className="sr-only">{showGrid ? "Hide Grid" : "Show Grid"}</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						{showGrid ? "Hide Grid" : "Show Grid"}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
							onClick={zoomIn}
						>
							<ZoomIn className="h-4 w-4" />
							<span className="sr-only">Zoom In</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						Zoom In
					</TooltipContent>
				</Tooltip>

				<div className="flex items-center justify-center text-xs bg-background/80 backdrop-blur rounded p-1 border border-border">
					{currentZoom}%
				</div>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
							onClick={zoomOut}
						>
							<ZoomOut className="h-4 w-4" />
							<span className="sr-only">Zoom Out</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						Zoom Out
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
							onClick={resetView}
						>
							<RefreshCw className="h-4 w-4" />
							<span className="sr-only">Reset View</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						Reset View
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}