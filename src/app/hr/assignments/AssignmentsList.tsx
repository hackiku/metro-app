// src/app/hr/assignments/AssignmentsList.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { AssignPositionForm } from "./AssignPositionForm";
import { toast } from "sonner";
import { DraggableTable, type Column } from "~/components/tables/DraggableTable";

// Define our position detail type
interface PositionDetail {
	id: string;
	level: number;
	sequence_in_path?: number;
	path_specific_description: string | null;
	positions?: {
		id: string;
		name: string;
		base_description: string | null;
	} | null;
}

interface AssignmentsListProps {
	careerPathId: string;
	onChangesUpdate?: (hasChanges: boolean) => void;
	onSave?: () => void;
	onReset?: () => void;
}

export function AssignmentsList({
	careerPathId,
	onChangesUpdate,
	onSave,
	onReset
}: AssignmentsListProps) {
	const { currentOrgId } = useSession();
	const [isAssigning, setIsAssigning] = useState(false);
	const [isEditing, setIsEditing] = useState<string | null>(null);
	const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
	const [hasLocalChanges, setHasLocalChanges] = useState(false);
	const [pendingMoves, setPendingMoves] = useState<{
		id: string;
		level: number;
		sequenceInPath: number;
	}[]>([]);

	// Store the original positions order to enable reset
	const [originalPositions, setOriginalPositions] = useState<PositionDetail[]>([]);
	const [currentPositions, setCurrentPositions] = useState<PositionDetail[]>([]);

	// Keep track of if we're currently in a mutation to prevent refetching during updates
	const isSaving = useRef(false);
	const mutationCount = useRef(0);
	const totalMutations = useRef(0);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch positions assigned to this career path
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrgId!,
			careerPathId
		},
		{
			enabled: !!currentOrgId && !!careerPathId,
			refetchOnWindowFocus: false,
			// Important: Don't refetch while we're saving changes
			refetchOnMount: !isSaving.current
		}
	);

	// Set up mutation for updating position order with callbacks
	const updatePositionMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			mutationCount.current += 1;

			// Only invalidate after all mutations are done
			if (mutationCount.current === totalMutations.current) {
				isSaving.current = false;
				mutationCount.current = 0;
				totalMutations.current = 0;

				// Now it's safe to invalidate the cache
				utils.position.getByCareerPath.invalidate({
					organizationId: currentOrgId!,
					careerPathId
				});
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
			setConfirmRemoveId(null);
			toast.success("Position removed from path");
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
		},
		onError: (error) => {
			toast.error(`Failed to remove: ${error.message}`);
		}
	});

	// Process positions when data is loaded
	useEffect(() => {
		if (pathPositionsQuery.data && !isSaving.current) {
			// Sort positions by level and sequence
			const sortedPositions = [...pathPositionsQuery.data].sort((a, b) => {
				const levelDiff = a.level - b.level;
				if (levelDiff !== 0) return levelDiff;

				const aSeq = a.sequence_in_path || a.level;
				const bSeq = b.sequence_in_path || b.level;
				return aSeq - bSeq;
			});

			setOriginalPositions(sortedPositions);
			setCurrentPositions(sortedPositions);
			setHasLocalChanges(false);
			setPendingMoves([]);

			// Notify parent of changes state
			if (onChangesUpdate) {
				onChangesUpdate(false);
			}
		}
	}, [pathPositionsQuery.data, onChangesUpdate]);

	// Handle row movement (reordering)
	const handleRowMove = (sourceId: string, targetId: string) => {
		// Find the source and target positions
		const sourceIdx = currentPositions.findIndex(p => p.id === sourceId);
		const targetIdx = currentPositions.findIndex(p => p.id === targetId);

		if (sourceIdx < 0 || targetIdx < 0) return;

		// Create new array with reordered positions
		const newOrder = [...currentPositions];
		const [movedItem] = newOrder.splice(sourceIdx, 1);
		newOrder.splice(targetIdx, 0, movedItem);

		// Update BOTH level and sequence numbers for ALL positions
		const updatedPositions = newOrder.map((position, index) => {
			const newLevel = index + 1;
			return {
				...position,
				level: newLevel,
				sequence_in_path: newLevel
			};
		});

		// Track the pending moves - include ALL positions that changed
		const newPendingMoves = updatedPositions
			.filter((position, index) => {
				const origPosition = originalPositions.find(p => p.id === position.id);
				// Include if level or sequence changed from original
				return !origPosition || 
					position.level !== origPosition.level || 
					position.sequence_in_path !== origPosition.sequence_in_path;
			})
			.map(position => ({
				id: position.id,
				level: position.level,
				sequenceInPath: position.sequence_in_path || position.level
			}));

		// Update state
		setCurrentPositions(updatedPositions);
		setPendingMoves(newPendingMoves);
		setHasLocalChanges(true);

		// Notify parent of changes
		if (onChangesUpdate) {
			onChangesUpdate(true);
		}
	};

	// Handle editing a position
	const handleEditPosition = (id: string) => {
		setIsEditing(id);
	};

	// Perform the actual save operation
	const handleSaveChanges = () => {
		if (pendingMoves.length === 0) {
			return;
		}

		// Set flag to prevent refetching during save
		isSaving.current = true;
		totalMutations.current = pendingMoves.length;
		mutationCount.current = 0;

		// Apply all pending moves
		pendingMoves.forEach(move => {
			updatePositionMutation.mutate({
				id: move.id,
				level: move.level,
				sequenceInPath: move.sequenceInPath
			});
		});

		// Reset local tracking - we'll maintain currentPositions until the actual refetch
		setHasLocalChanges(false);
		setPendingMoves([]);

		// Notify parent
		if (onChangesUpdate) {
			onChangesUpdate(false);
		}

		toast.success("Position order saved");
	};

	// Handle reset changes
	const handleResetChanges = () => {
		setCurrentPositions(originalPositions);
		setHasLocalChanges(false);
		setPendingMoves([]);

		// Notify parent
		if (onChangesUpdate) {
			onChangesUpdate(false);
		}
	};

	// Register callbacks with parent component for save event
	useEffect(() => {
		const saveHandler = () => {
			handleSaveChanges();
		};

		document.addEventListener('save-positions', saveHandler);
		return () => document.removeEventListener('save-positions', saveHandler);
	}, [pendingMoves]);

	// Register callbacks with parent component for reset event
	useEffect(() => {
		const resetHandler = () => {
			handleResetChanges();
		};

		document.addEventListener('reset-positions', resetHandler);
		return () => document.removeEventListener('reset-positions', resetHandler);
	}, [originalPositions, onChangesUpdate]);

	// Handle prompting to remove a position
	const handleRemovePrompt = (id: string) => {
		setConfirmRemoveId(id);
	};

	// Handle confirming removal
	const handleRemovePosition = (id: string) => {
		removePositionMutation.mutate({ id });
	};

	// Define columns for the DraggableTable
	const columns: Column<PositionDetail>[] = [
		{
			key: "position",
			header: "Position",
			width: "w-[40%]",
			render: (detail) => (
				<div>
					<div className="font-medium">
						{detail.positions?.name || "Unknown Position"}
					</div>
				</div>
			)
		},
		{
			key: "level",
			header: "Level",
			width: "w-[15%]",
			render: (detail) => (
				<div className="flex items-center">
					<span className="font-medium text-sm bg-muted px-2 py-0.5 rounded">
						L{detail.level}
					</span>
					{detail.sequence_in_path && detail.sequence_in_path !== detail.level && (
						<span className="text-xs text-muted-foreground ml-1.5">
							({detail.sequence_in_path})
						</span>
					)}
				</div>
			)
		},
		{
			key: "description",
			header: "Description",
			width: "w-[45%]",
			render: (detail) => (
				<>
					<div className="text-sm line-clamp-2">
						{detail.path_specific_description || detail.positions?.base_description || "No description provided"}
					</div>
					{detail.positions?.base_description && (
						<div className="text-xs text-muted-foreground mt-0.5">
							{detail.positions.base_description}
						</div>
					)}
				</>
			)
		}
	];

	// Create position detail URL
	const getPositionDetailUrl = (id: string) => {
		const position = currentPositions.find(p => p.id === id);
		if (position && position.positions) {
			return `/position/${position.positions.id}`;
		}
		return "#";
	};

	return (
		<>
			<DraggableTable
				data={currentPositions}
				columns={columns}
				isLoading={pathPositionsQuery.isLoading}
				onRowMove={handleRowMove}
				onEdit={handleEditPosition}
				onRemove={handleRemovePrompt}
				getRowUrl={getPositionDetailUrl}
				hasChanges={hasLocalChanges}
				onSaveChanges={handleSaveChanges}
				onResetChanges={handleResetChanges}
				primaryAction={{
					label: "Assign New Position",
					onClick: () => setIsAssigning(true)
				}}
				emptyState={{
					title: "No Positions Assigned",
					description: "This career path doesn't have any positions assigned yet",
					action: {
						label: "Assign First Position",
						onClick: () => setIsAssigning(true)
					}
				}}
			/>

			{/* Assign Position Dialog */}
			<Dialog open={isAssigning} onOpenChange={setIsAssigning}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Assign Position to Path</DialogTitle>
						<DialogDescription>
							Add a position to this career path
						</DialogDescription>
					</DialogHeader>

					<AssignPositionForm
						careerPathId={careerPathId}
						onComplete={() => setIsAssigning(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Position Dialog */}
			<Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Position</DialogTitle>
						<DialogDescription>
							Update position details
						</DialogDescription>
					</DialogHeader>

					{isEditing && (
						<AssignPositionForm
							careerPathId={careerPathId}
							positionDetailId={isEditing}
							onComplete={() => setIsEditing(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Remove Position Confirmation Dialog */}
			<Dialog
				open={!!confirmRemoveId}
				onOpenChange={(open) => !open && setConfirmRemoveId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Removal</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove this position from the career path? This won't delete the position itself.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setConfirmRemoveId(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => confirmRemoveId && handleRemovePosition(confirmRemoveId)}
							disabled={removePositionMutation.isPending}
						>
							{removePositionMutation.isPending ? (
								<>
									<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
									Removing...
								</>
							) : (
								'Remove'
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}