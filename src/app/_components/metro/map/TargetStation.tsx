// src/app/_components/metro/map/TargetStation.tsx
"use client"

import { useState } from 'react';
import { Trash2, Navigation, ArrowRight } from 'lucide-react';
import type { LayoutNode } from '~/types/engine';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';

interface TargetStationProps {
	node: LayoutNode;
	onRemoveTarget: (nodeId: string) => void;
	inverseScale: number;
}

export function TargetStation({ node, onRemoveTarget, inverseScale }: TargetStationProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const baseStationSize = node.isInterchange ? 24 : 18;

	// Prevent click propagation to the station itself
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<g
			className="target-station-indicator"
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Target marker above station */}
			<g transform={`scale(${inverseScale})`}>
				{/* Pulsing background */}
				<circle
					cy={-baseStationSize - 14}
					r={12}
					fill="rgba(245, 158, 11, 0.2)"
					className="animate-pulse"
				/>

				{/* Target circle */}
				<circle
					cy={-baseStationSize - 14}
					r={10}
					fill="#f59e0b"
					stroke="white"
					strokeWidth={2}
				/>

				{/* Target icon */}
				<Navigation
					color="white"
					size={12}
					style={{
						transform: `translate(-6px, ${-baseStationSize - 20}px)`,
					}}
				/>

				{/* Target hover info */}
				{isHovered && !isMenuOpen && (
					<foreignObject
						x={-100}
						y={-baseStationSize - 80}
						width={200}
						height={56}
						style={{ pointerEvents: 'none' }}
					>
						<div className="flex justify-center">
							<div className="bg-background border border-amber-500/20 shadow-md rounded-md px-3 py-2 w-auto">
								<div className="text-sm font-medium mb-0.5">Target Destination</div>
								<div className="text-xs text-muted-foreground flex items-center gap-1">
									<Navigation size={10} className="text-amber-500" />
									<span>{node.name}</span>
									<span className="text-muted-foreground/60 ml-1">Level {node.level}</span>
								</div>
							</div>
						</div>
					</foreignObject>
				)}

				{/* Remove Target Dropdown */}
				<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<DropdownMenuTrigger asChild>
						<circle
							cy={-baseStationSize - 14}
							r={14}
							fill="transparent"
							className="cursor-pointer"
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" sideOffset={5}>
						<DropdownMenuItem
							className="gap-2 cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								window.open(`/positions/${node.positionId}`, '_blank');
								setIsMenuOpen(false);
							}}
						>
							<ArrowRight size={16} />
							<span>View Position</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="gap-2 cursor-pointer text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onRemoveTarget(node.id);
								setIsMenuOpen(false);
							}}
						>
							<Trash2 size={16} />
							<span>Remove Target</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</g>
		</g>
	);
}