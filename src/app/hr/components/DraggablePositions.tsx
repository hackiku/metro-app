// src/components/hr/positions/DraggablePositions.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { GripVertical, MoreHorizontal, Plus, Save, X } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";

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
	onAssignPosition: () => void;
}

export function DraggablePositions({
	careerPathId,
	onAssignPosition
}: DraggablePositionsProps) {
	const { currentOrgId } = useSession();
	const [positions, setPositions] = useState<Position[]>([]);
	const [groupedPositions, setGroupedPositions] = useState<Record<number, Position[]>>({});
	const [hasChanges, setHasChanges] = useState(false);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch positions assigned to this career path
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrgId!,
			careerPathId
		},
		{ enabled: !!currentOrgId && !!careerPathId }
	);

	// Set up mutation for updating position details
	const updatePositionMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
			toast.success("Position order updated successfully");
			setHasChanges(false);
		},
		onError: (error) => {
			toast.error(`Failed to update: ${error.message}`);
		}
	});

	// Set up mutation for removing position from path
	const removePositionMutation = api.position.removeFromPath.useMutation({
		onSuccess: () => {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
			toast.success("Position removed from path successfully");
		},
		onError: (error) => {
			toast.error(`Failed to remove: ${error.message}`);
		}
	});

	// Process positions when data is loaded
	useEffect(() => {
		if (pathPositionsQuery.data) {
			setPositions(pathPositionsQuery.data);

			// Group positions by level
			const grouped: Record<number, Position[]> = {};

			pathPositionsQuery.data.forEach(position => {
				const level = position.level;

				if (!grouped[level]) {
					grouped[level] = [];
				}

				grouped[level].push(position);
			});

			// Sort positions within each level by sequence
			Object.keys(grouped).forEach(levelKey => {
				const level = Number(levelKey);

				grouped[level].sort((a, b) => {
					const aSeq = a.sequence_in_path || a.level;
					const bSeq = b.sequence_in_path || b.level;
					return aSeq - bSeq;
				});
			});

			setGroupedPositions(grouped);
		}
	}, [pathPositionsQuery.data]);

	// Drag and drop handlers
	const handleDragStart = (event: React.DragEvent, positionId: string, level: number) => {
		setDraggingId(positionId);
		event.dataTransfer.setData("positionId", positionId);
		event.dataTransfer.setData("fromLevel", String(level));
	};

	const handleDragOver = (event: React.DragEvent, targetLevel: number) => {
		event.preventDefault();
		setDragOverLevel(targetLevel);
	};

	const handleDrop = (event: React.DragEvent, targetLevel: number) => {
		event.preventDefault();

		const positionId = event.dataTransfer.getData("positionId");
		const fromLevel = Number(event.dataTransfer.getData("fromLevel"));

		// If dropping in same level, just reorder
		if (fromLevel === targetLevel) {
			handleReorder(positionId, targetLevel);
		} else {
			// If dropping in different level, change level and position
			handleLevelChange(positionId, fromLevel, targetLevel);
		}

		setDraggingId(null);
		setDragOverLevel(null);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
		setDragOverLevel(null);
	};

	// Handle reordering within the same level
	const handleReorder = (positionId: string, level: number) => {
		if (!groupedPositions[level]) return;

		const newGrouped = { ...groupedPositions };

		// Find the position that was dragged
		const draggedPosition = positions.find(p => p.id === positionId);
		if (!draggedPosition) return;

		// Update sequences
		const updatedLevelPositions = [...newGrouped[level]];

		// Reorder by assigning sequential sequence numbers
		updatedLevelPositions.forEach((position, index) => {
			position.sequence_in_path = index + 1;
		});

		// Update the state
		newGrouped[level] = updatedLevelPositions;
		setGroupedPositions(newGrouped);
		setHasChanges(true);
	};

	// Handle level change
	const handleLevelChange = (positionId: string, fromLevel: number, toLevel: number) => {
		if (!groupedPositions[fromLevel] || !groupedPositions[toLevel]) return;

		const newGrouped = { ...groupedPositions };

		// Find the position that was dragged
		const draggedPosition = positions.find(p => p.id === positionId);
		if (!draggedPosition) return;

		// Remove from original level
		newGrouped[fromLevel] = newGrouped[fromLevel].filter(p => p.id !== positionId);

		// Add to new level
		const updatedPosition = { ...draggedPosition, level: toLevel };
		newGrouped[toLevel] = [...newGrouped[toLevel], updatedPosition];

		// Update sequences for both levels
		newGrouped[fromLevel].forEach((position, index) => {
			position.sequence_in_path = index + 1;
		});

		newGrouped[toLevel].forEach((position, index) => {
			position.sequence_in_path = index + 1;
		});

		// Update the state
		setGroupedPositions(newGrouped);
		setHasChanges(true);
	};

	// Save changes to all positions
	const saveChanges = () => {
		// Flatten grouped positions
		const updatedPositions: Position[] = [];

		Object.keys(groupedPositions).forEach(levelKey => {
			const level = Number(levelKey);

			groupedPositions[level].forEach((position, index) => {
				updatedPositions.push({
					...position,
					level: level,
					sequence_in_path: index + 1
				});
			});
		});

		// Update each position
		updatedPositions.forEach(position => {
			updatePositionMutation.mutate({
				id: position.id,
				level: position.level,
				sequenceInPath: position.sequence_in_path,
				pathSpecificDescription: position.path_specific_description
			});
		});
	};

	// Remove position from path
	const handleRemovePosition = (id: string) => {
		removePositionMutation.mutate({ id });
	};

	// Loading state
	if (pathPositionsQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mr-2" />
				<span>Loading positions...</span>
			</div>
		);
	}

	// No positions state
	if (pathPositionsQuery.data?.length === 0) {
		return (
			<div className="text-center py-6">
				<p className="text-muted-foreground mb-4">No positions assigned to this career path yet.</p>
				<Button onClick={onAssignPosition}>
					<Plus className="mr-2 h-4 w-4" />
					Assign Position
				</Button>
			</div>
		);
	}

	// Render the draggable position groups
	return (
		<div className="space-y-6">
			{hasChanges && (
				<div className="flex items-center justify-between px-4 py-2 bg-primary/10 border border-primary/20 rounded-md">
					<span className="text-sm">You have unsaved changes to position order</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								// Reset to original data
								if (pathPositionsQuery.data) {
									setPositions(pathPositionsQuery.data);

									// Regroup
									const grouped: Record<number, Position[]> = {};

									pathPositionsQuery.data.forEach(position => {
										const level = position.level;

										if (!grouped[level]) {
											grouped[level] = [];
										}

										grouped[level].push(position);
									});

									Object.keys(grouped).forEach(levelKey => {
										const level = Number(levelKey);

										grouped[level].sort((a, b) => {
											const aSeq = a.sequence_in_path || a.level;
											const bSeq = b.sequence_in_path || b.level;
											return aSeq - bSeq;
										});
									});

									setGroupedPositions(grouped);
									setHasChanges(false);
								}
							}}
						>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={saveChanges}
							disabled={updatePositionMutation.isPending}
						>
							{updatePositionMutation.isPending ? (
								<>
									<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</div>
			)}

			<div className="space-y-6">
				{Object.keys(groupedPositions)
					.map(Number)
					.sort((a, b) => a - b)
					.map(level => (
						<div
							key={level}
							className={`relative rounded-md border p-4 ${dragOverLevel === level ? 'bg-muted/50 border-primary/50' : ''}`}
							onDragOver={(e) => handleDragOver(e, level)}
							onDrop={(e) => handleDrop(e, level)}
						>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-medium flex items-center">
									<Badge variant="outline" className="mr-2">Level {level}</Badge>
									<span className="text-muted-foreground text-xs">
										{groupedPositions[level].length} position(s)
									</span>
								</h3>
							</div>

							<div className="flex items-center gap-2 flex-wrap">
								{groupedPositions[level].map((position) => (
									<div
										key={position.id}
										className={`
                      flex items-center gap-1 px-3 py-2 bg-card rounded-md border shadow-sm
                      ${draggingId === position.id ? 'opacity-50' : ''}
                      ${!position.positions ? 'border-destructive/50 bg-destructive/10' : ''}
                    `}
										draggable
										onDragStart={(e) => handleDragStart(e, position.id, level)}
										onDragEnd={handleDragEnd}
									>
										<GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
										<div className="flex items-center gap-2">
											<span className="font-medium">
												{position.positions?.name || "Unknown Position"}
											</span>
											{position.sequence_in_path && position.sequence_in_path !== level && (
												<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
													{position.sequence_in_path}
												</span>
											)}
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
													<MoreHorizontal className="h-3 w-3" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => handleRemovePosition(position.id)}
												>
													Remove from Path
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								))}

								<Button
									variant="outline"
									size="sm"
									className="whitespace-nowrap"
									onClick={onAssignPosition}
								>
									<Plus className="h-4 w-4 mr-1" />
									Assign
								</Button>
							</div>
						</div>
					))}
			</div>

			<div className="flex justify-end">
				<Button
					variant="outline"
					onClick={onAssignPosition}
				>
					<Plus className="mr-2 h-4 w-4" />
					Assign New Position
				</Button>
			</div>
		</div>
	);
}