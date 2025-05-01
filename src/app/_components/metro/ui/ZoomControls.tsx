// src/app/_components/metro/ui/ZoomControls.tsx
"use client";

import React from 'react';
import { Button } from '~/components/ui/button';
import { Grid, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface ZoomControlsProps {
	onZoomIn: () => void;
	onZoomOut: () => void;
	onZoomReset: () => void;
	showGrid: boolean;
	onToggleGrid: () => void;
	className?: string;
}

export default function ZoomControls({
	onZoomIn,
	onZoomOut,
	onZoomReset,
	showGrid,
	onToggleGrid,
	className = ""
}: ZoomControlsProps) {
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<Button
				variant="outline"
				size="icon"
				className="bg-background/80 backdrop-blur hover:bg-background/90"
				onClick={onToggleGrid}
				title={showGrid ? "Hide Grid" : "Show Grid"}
			>
				<Grid className={`h-4 w-4 ${showGrid ? 'text-primary' : ''}`} />
			</Button>
			<Button
				variant="outline"
				size="icon"
				className="bg-background/80 backdrop-blur hover:bg-background/90"
				onClick={onZoomIn}
				title="Zoom In"
			>
				<ZoomIn className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				className="bg-background/80 backdrop-blur hover:bg-background/90"
				onClick={onZoomOut}
				title="Zoom Out"
			>
				<ZoomOut className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				className="bg-background/80 backdrop-blur hover:bg-background/90"
				onClick={onZoomReset}
				title="Reset View"
			>
				<RefreshCw className="h-4 w-4" />
			</Button>
		</div>
	);
}