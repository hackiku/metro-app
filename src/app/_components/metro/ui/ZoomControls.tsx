// src/app/_components/metro/ui/ZoomControls.tsx
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

interface ZoomControlsProps {
	onZoomIn: () => void;
	onZoomOut: () => void;
	onZoomReset: () => void;
	showGrid: boolean;
	onToggleGrid: () => void;
	className?: string;
	currentZoom?: number; // Optional prop to display current zoom level
}

export default function ZoomControls({
	onZoomIn,
	onZoomOut,
	onZoomReset,
	showGrid,
	onToggleGrid,
	className = "",
	currentZoom
}: ZoomControlsProps) {
	return (
		<TooltipProvider>
			<div className={`flex flex-col gap-2 ${className}`}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
							onClick={onToggleGrid}
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
							onClick={onZoomIn}
						>
							<ZoomIn className="h-4 w-4" />
							<span className="sr-only">Zoom In</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						Zoom In
					</TooltipContent>
				</Tooltip>

				{currentZoom && (
					<div className="flex items-center justify-center text-xs bg-background/80 backdrop-blur rounded p-1 border border-border">
						{Math.round(currentZoom * 100)}%
					</div>
				)}

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
							onClick={onZoomOut}
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
							onClick={onZoomReset}
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