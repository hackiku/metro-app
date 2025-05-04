// src/app/hr/assignments/AssignmentsList.tsx
"use client";

import { useState } from "react";
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
}

export function AssignmentsList({ careerPathId }: AssignmentsListProps) {
	const { currentOrgId } = useSession();
	const [isAssigning, setIsAssigning] = useState(false);
	const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

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

	// Set up mutation for updating position order
	const updatePositionMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			toast.success("Position order updated");
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
		},
		onError: (error) => {
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

	// Handle row movement (reordering)
	const handleRowMove = (sourceId: string, targetId: string) => {
		// Find the source and target positions
		const positions = pathPositionsQuery.data || [];
		const sourceIdx = positions.findIndex(p => p.id === sourceId);
		const targetIdx = positions.findIndex(p => p.id === targetId);

		if (sourceIdx < 0 || targetIdx < 0) return;

		// Create new array with reordered positions
		const newOrder = [...positions];
		const [movedItem] = newOrder.splice(sourceIdx, 1);
		newOrder.splice(targetIdx, 0, movedItem);

		// Update sequence in path for all affected positions
		newOrder.forEach((position, index) => {
			// Only update if sequence changed
			if (position.sequence_in_path !== index + 1) {
				updatePositionMutation.mutate({
					id: position.id,
					sequenceInPath: index + 1
				});
			}
		});
	};

	// Handle prompting to remove a position
	const handleRemovePrompt = (id: string) => {
		setConfirmRemoveId(id);
	};

	// Handle confirming removal
	const handleRemovePosition = (id: string) => {
		removePositionMutation.mutate({ id });
	};

	// Sort positions by level and sequence
	const sortedPositions = [...(pathPositionsQuery.data || [])].sort((a, b) => {
		const levelDiff = a.level - b.level;
		if (levelDiff !== 0) return levelDiff;

		// If levels are the same, sort by sequence
		const aSeq = a.sequence_in_path || a.level;
		const bSeq = b.sequence_in_path || b.level;
		return aSeq - bSeq;
	});

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
					{detail.positions?.base_description && (
						<div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
							{detail.positions.base_description}
						</div>
					)}
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
				<div className="text-sm line-clamp-2">
					{detail.path_specific_description || detail.positions?.base_description || "No description provided"}
				</div>
			)
		}
	];

	return (
		<>
			<DraggableTable
				data={sortedPositions}
				columns={columns}
				isLoading={pathPositionsQuery.isLoading}
				onRowMove={handleRowMove}
				onRemove={handleRemovePrompt}
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