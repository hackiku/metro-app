// src/app/_components/metro/map/StationMenu.tsx
"use client"

import React from 'react';
import { Target, Eye, ArrowRight, Star } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from '~/components/ui/dropdown-menu';
import type { LayoutNode } from '~/types/engine';

interface StationMenuProps {
	node: LayoutNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onNodeSelect: (nodeId: string) => void;
	onSetTarget: (nodeId: string) => void;
	onSetAsFavorite: (nodeId: string) => void;
	stationSize: number;
	inverseScale: number;
}

export function StationMenu({
	node,
	isOpen,
	onOpenChange,
	onNodeSelect,
	onSetTarget,
	onSetAsFavorite,
	stationSize,
	inverseScale
}: StationMenuProps) {
	const levelIndicator = `${node.level}`;

	return (
		<DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<circle
					r={(stationSize / 2 + 8) * inverseScale}
					fill="transparent"
					className="cursor-pointer"
					onClick={(e) => {
						e.stopPropagation();
					}}
				/>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="center" sideOffset={5}>
				<DropdownMenuLabel className="font-normal py-1 pb-2">
					<span className="block font-medium text-sm">{node.name}</span>
					<span className="block text-xs text-muted-foreground">{levelIndicator}</span>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{/* View details */}
				<DropdownMenuItem
					className="gap-2 cursor-pointer"
					onClick={() => {
						onNodeSelect(node.id);
						onOpenChange(false);
					}}
				>
					<Eye size={16} />
					<span>View Details</span>
				</DropdownMenuItem>

				{/* Set as target */}
				<DropdownMenuItem
					className="gap-2 cursor-pointer"
					onClick={() => {
						onSetTarget(node.id);
						onOpenChange(false);
					}}
				>
					<Target size={16} />
					<span>Set as Target</span>
				</DropdownMenuItem>

				{/* Add to favorites */}
				<DropdownMenuItem
					className="gap-2 cursor-pointer"
					onClick={() => {
						onSetAsFavorite(node.id);
						onOpenChange(false);
					}}
				>
					<Star size={16} />
					<span>Add to Favorites</span>
				</DropdownMenuItem>

				{/* Explore path */}
				{/* <DropdownMenuItem
					className="gap-2 cursor-pointer"
					onClick={() => {
						onOpenChange(false);
					}}
				>
					<ArrowRight size={16} />
					<span>Explore Path</span>
				</DropdownMenuItem> */}
				
			</DropdownMenuContent>
		</DropdownMenu>
	);
}