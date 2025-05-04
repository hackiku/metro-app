// src/app/hr/components/DraggablePositions.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
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
	const { currentOrgId } = useSession();
	const [positions, setPositions] = useState<Position[]>([]);
	const [draggingId, setDraggingId] = useState<string | null>(null);

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
			toast.success("Position order updated");
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
			toast.success("Position removed from path");
		},
		onError: (error) => {
			toast.error(`Failed to remove: ${error.message}`);
		}
	});

	// Process positions when data is loaded
	useEffect(() => {
		if (pathPositionsQuery.data) {
			const sortedPositions = [...pathPositionsQuery.data].sort((a, b) => {
				const levelDiff = a.level - b.level;
				if (levelDiff !== 0) return levelDiff;

				const aSeq = a.sequence_in_path || a.level;
				const bSeq = b.sequence_in_path || b.level;
				return aSeq - bSeq;
			});

			setPositions(sortedPositions);
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
		const [draggedItem] = newPositions.splice(sourceIndex, 1);
		newPositions.splice(targetIndex, 0, draggedItem);

		// Update sequence numbers
		const updatedPositions = newPositions.map((position, index) => ({
			...position,
			sequence_in_path: index + 1
		}));

		// Update state and save changes
		setPositions(updatedPositions);

		// Save the new order to the database
		const draggedPosition = updatedPositions.find(p => p.id === positionId);
		if (draggedPosition) {
			updatePositionMutation.mutate({
				id: draggedPosition.id,
				sequenceInPath: draggedPosition.sequence_in_path
			});
		}

		setDraggingId(null);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
	};

	// Remove position from path
	const handleRemovePosition = (id: string) => {
		removePositionMutation.mutate({ id });
	};

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

	// Render the simplified position row
	return (
		<div className="relative py-2">
			{/* Path line that runs through the positions */}
			<div
				className="absolute left-0 right-0 h-[3px] top-1/2 transform -translate-y-1/2 z-0"
				style={{ backgroundColor: pathColor || "#4299E1" }}
			/>

			<div className="flex flex-wrap items-center gap-3 relative z-10">
				{positions.map((position) => (
					<div
						key={position.id}
						className={`
              flex items-center gap-1 px-3 py-1.5 bg-card rounded-md border shadow-sm z-10
              ${draggingId === position.id ? 'opacity-50' : ''}
              ${!position.positions ? 'border-destructive/50 bg-destructive/10' : ''}
            `}
						draggable
						onDragStart={(e) => handleDragStart(e, position.id)}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, position.id)}
						onDragEnd={handleDragEnd}
					>
						<span className="font-medium text-sm">
							{position.positions?.name || "Unknown Position"}
						</span>
						<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
							L{position.level}
						</span>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
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
				))}
			</div>
		</div>
	);
}