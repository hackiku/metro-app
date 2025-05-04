// src/app/hr/components/DraggablePositions.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, ExternalLink, Save, RotateCcw } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import Link from "next/link";

interface Position {
	id: string;
	level: number;
	sequence_in_path?: number | null;
	path_specific_description: string | null;
	positions?: {
		id: string;
		name: string;
		base_description: string | null;
	} | null;
}

interface DraggablePositionsProps {
	careerPathId: string;
	pathColor?: string | null;
}

export function DraggablePositions({
	careerPathId,
	pathColor = "#4299E1"
}: DraggablePositionsProps) {
	const { currentOrganization } = useOrganization();
	const [positions, setPositions] = useState<Position[]>([]);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [originalPositions, setOriginalPositions] = useState<Position[]>([]);
	const [hasLocalChanges, setHasLocalChanges] = useState(false);

	// Keep track of whether we're in the process of updating positions
	const isSaving = useRef(false);
	const mutationCount = useRef(0);
	const totalMutations = useRef(0);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch positions assigned to this career path
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrganization?.id! || "",
			careerPathId
		},
		{
			enabled: !!currentOrganization?.id && !!careerPathId,
			// Don't auto-refetch while we're updating positions
			refetchOnWindowFocus: false
		}
	);

	// Set up mutation for updating position details
	const updatePositionMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			mutationCount.current += 1;

			// Only invalidate after all mutations are done
			if (mutationCount.current === totalMutations.current) {
				// Reset state after successful updates
				isSaving.current = false;
				mutationCount.current = 0;
				totalMutations.current = 0;

				// Only now show the success toast
				toast.success("Position order updated");

				// Now it's safe to invalidate the cache
				if (currentOrganization?.id) {
					utils.position.getByCareerPath.invalidate({
						organizationId: currentOrganization.id,
						careerPathId
					});
				}
			}
		},
		onError: (error) => {
			isSaving.current = false;
			mutationCount.current = 0;
			totalMutations.current = 0;
			toast.error(`Failed to update: ${error.message}`);
		}
	});

	// Set up mutation for removing position from path
	const removePositionMutation = api.position.removeFromPath.useMutation({
		onSuccess: () => {
			if (currentOrganization?.id) {
				utils.position.getByCareerPath.invalidate({
					organizationId: currentOrganization.id,
					careerPathId
				});
			}
			toast.success("Position removed from path");
		},
		onError: (error) => {
			toast.error(`Failed to remove: ${error.message}`);
		}
	});

	// Process positions when data is loaded
	useEffect(() => {
		if (pathPositionsQuery.data && !isSaving.current) {
			const sortedPositions = [...pathPositionsQuery.data].sort((a, b) => {
				const levelDiff = a.level - b.level;
				if (levelDiff !== 0) return levelDiff;

				const aSeq = a.sequence_in_path || a.level;
				const bSeq = b.sequence_in_path || b.level;
				return aSeq - bSeq;
			});

			setPositions(sortedPositions);
			setOriginalPositions(sortedPositions);
			setHasLocalChanges(false);
		}
	}, [pathPositionsQuery.data]);

	// Drag and drop handlers
	const handleDragStart = (event: React.DragEvent, positionId: string) => {
		setDraggingId(positionId);
		event.dataTransfer.setData("positionId", positionId);
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
	};

	const handleDrop = (event: React.DragEvent, targetId: string) => {
		event.preventDefault();

		const positionId = event.dataTransfer.getData("positionId");
		if (positionId === targetId) return;

		// Get indices for reordering
		const sourceIndex = positions.findIndex(p => p.id === positionId);
		const targetIndex = positions.findIndex(p => p.id === targetId);

		if (sourceIndex < 0 || targetIndex < 0) return;

		// Create a new array with the dragged item moved to the new position
		const newPositions = [...positions];
		const [movedItem] = newPositions.splice(sourceIndex, 1);
		newPositions.splice(targetIndex, 0, movedItem);

		// Update sequence numbers and levels for ALL positions based on their new order
		// This is the key improvement - we're updating both sequence_in_path AND level
		const updatedPositions = newPositions.map((position, index) => {
			// Assign sequential levels based on position in the array (1-based)
			const newLevel = index + 1;
			return {
				...position,
				level: newLevel,
				sequence_in_path: newLevel
			};
		});

		// Save the updated positions in local state immediately
		setPositions(updatedPositions);
		setHasLocalChanges(true);

		setDraggingId(null);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
	};

	// Save changes to database
	const handleSaveChanges = () => {
		if (!hasLocalChanges) return;

		// Find all positions that need to be updated in the database
		const positionsToUpdate = positions
			.filter(position => {
				const origPosition = originalPositions.find(p => p.id === position.id);
				return !origPosition ||
					position.level !== origPosition.level ||
					position.sequence_in_path !== origPosition.sequence_in_path;
			});

		if (positionsToUpdate.length === 0) {
			setHasLocalChanges(false);
			return;
		}

		// Set flags for batch update
		isSaving.current = true;
		totalMutations.current = positionsToUpdate.length;
		mutationCount.current = 0;

		// Save all position changes to the database
		positionsToUpdate.forEach(position => {
			updatePositionMutation.mutate({
				id: position.id,
				level: position.level,
				sequenceInPath: position.sequence_in_path
			});
		});

		// Updates will be applied after all mutations complete
	};

	// Reset positions to original state
	const handleResetChanges = () => {
		setPositions(originalPositions);
		setHasLocalChanges(false);
	};

	// Remove position from path
	const handleRemovePosition = (id: string) => {
		if (confirm("Are you sure you want to remove this position from the path?")) {
			removePositionMutation.mutate({ id });
		}
	};

	// No organization selected
	if (!currentOrganization) {
		return (
			<div className="text-center py-2 text-sm text-muted-foreground">
				No organization selected
			</div>
		);
	}

	// Loading state
	if (pathPositionsQuery.isLoading) {
		return (
			<div className="flex items-center justify-center py-4">
				<div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full" />
			</div>
		);
	}

	// No positions state
	if (positions.length === 0) {
		return (
			<div className="text-center py-2 text-sm text-muted-foreground">
				No positions assigned
			</div>
		);
	}

	return (
		<div className="relative py-4">
			<div className="flex flex-wrap items-center gap-2 relative">
				{positions.map((position, index) => (
					<div key={position.id} className="flex items-center">
						{/* Position card with colored border */}
						<div
							className={`
                flex items-center gap-1 px-2.5 py-1 rounded-md border shadow-sm
                ${draggingId === position.id ? 'opacity-50' : ''}
                ${!position.positions ? 'border-destructive/50 bg-destructive/10' : ''}
              `}
							style={{ borderColor: pathColor || "#4299E1" }}
							draggable
							onDragStart={(e) => handleDragStart(e, position.id)}
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, position.id)}
							onDragEnd={handleDragEnd}
						>
							<span className="font-medium text-xs">
								{position.positions?.name || "Unknown Position"}
							</span>
							<span className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded-full">
								L{position.level}
							</span>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-5 w-5 ml-0.5">
										<MoreHorizontal className="h-3 w-3" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{position.positions && (
										<DropdownMenuItem asChild>
											<Link href={`/position/${position.positions.id}`} target="_blank">
												<ExternalLink className="h-3.5 w-3.5 mr-2" />
												View Position Page
											</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={() => handleRemovePosition(position.id)}
									>
										Remove from Path
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Connector line - only if not the last item */}
						{index < positions.length - 1 && (
							<div
								className="h-[2px] w-2 mx-1"
								style={{ backgroundColor: pathColor || "#4299E1" }}
							/>
						)}
					</div>
				))}

				{/* Add save and reset buttons at the end of the line */}
				<div className="flex items-center gap-2 ml-2">
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7"
						onClick={handleResetChanges}
						disabled={!hasLocalChanges}
					>
						<RotateCcw className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7"
						onClick={handleSaveChanges}
						disabled={!hasLocalChanges}
					>
						<Save className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}