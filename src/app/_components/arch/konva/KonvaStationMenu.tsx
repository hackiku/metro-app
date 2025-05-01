// src/app/_components/metro/konva/KonvaStationMenu.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Target, Trash2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { Portal } from '~/components/ui/portal';
import type { LayoutNode } from '~/types/engine';

interface KonvaStationMenuProps {
	node: LayoutNode;
	isTarget: boolean;
	stageRef: React.RefObject<any>;
	containerRef: React.RefObject<HTMLDivElement>;
	onSetTarget: (nodeId: string) => void;
	onRemoveTarget: (nodeId: string) => void;
}

export function KonvaStationMenu({
	node,
	isTarget,
	stageRef,
	containerRef,
	onSetTarget,
	onRemoveTarget
}: KonvaStationMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!stageRef.current || !containerRef.current) return;

		// Calculate the stage position
		const stage = stageRef.current;
		const viewport = stage.position();
		const scale = stage.scaleX();

		// Calculate the transformed coordinates of the node
		const x = node.x * scale + viewport.x;
		const y = node.y * scale + viewport.y;

		// Get container bounds
		const containerRect = containerRef.current.getBoundingClientRect();

		// Set position relative to container
		setPosition({
			x: x + containerRect.left,
			y: y + containerRect.top
		});
	}, [node, stageRef, containerRef]);

	// This component renders a hidden dropdown trigger and its content
	// We'll position it absolutely at the node's position
	return (
		<Portal>
			<div
				style={{
					position: 'absolute',
					left: `${position.x}px`,
					top: `${position.y}px`,
					transform: 'translate(-50%, -50%)',
					zIndex: 1000,
					pointerEvents: 'none', // Initially invisible to pointer events
				}}
			>
				<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							ref={triggerRef}
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0 opacity-0" // Invisible trigger
						>
							<span className="sr-only">Station Menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" sideOffset={5} className="z-[1001]">
						<DropdownMenuItem
							className="gap-2 cursor-pointer"
							onClick={() => {
								onSetTarget(node.id);
								setIsOpen(false);
							}}
						>
							<Target size={16} />
							<span>Set Target</span>
						</DropdownMenuItem>

						{isTarget && (
							<DropdownMenuItem
								className="gap-2 cursor-pointer text-destructive"
								onClick={() => {
									onRemoveTarget(node.id);
									setIsOpen(false);
								}}
							>
								<Trash2 size={16} />
								<span>Remove Target</span>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</Portal>
	);
}

// Export a helper to trigger the menu programmatically
export function triggerStationMenu(
	nodeId: string,
	stationMenus: Map<string, { setOpen: (open: boolean) => void }>
) {
	const stationMenu = stationMenus.get(nodeId);
	if (stationMenu) {
		stationMenu.setOpen(true);
	}
}