// src/app/hr/assignments/AssignmentsList.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { ActionTable, type Column } from "~/components/tables/ActionTable";
import { AssignPositionForm } from "./AssignPositionForm";
import { toast } from "sonner";

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
	pathName?: string;
}

export function AssignmentsList({
	careerPathId,
	pathName = "Career Path"
}: AssignmentsListProps) {
	const { currentOrgId } = useSession();
	const [isAssigning, setIsAssigning] = useState(false);
	const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
	const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

	// Edit form state
	const [editedDetail, setEditedDetail] = useState<{
		level?: number;
		sequenceInPath?: number;
		pathSpecificDescription?: string | null;
	}>({});

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

	// Set up mutations
	const updateDetailMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			setEditingDetailId(null);
			setEditedDetail({});
			toast.success("Position details updated successfully");

			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
		},
		onError: (error) => {
			toast.error(`Failed to update: ${error.message}`);
		}
	});

	const removePositionMutation = api.position.removeFromPath.useMutation({
		onSuccess: () => {
			setConfirmRemoveId(null);
			toast.success("Position removed from path successfully");

			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
		},
		onError: (error) => {
			toast.error(`Failed to remove: ${error.message}`);
		}
	});

	// Handler functions
	const handleEditDetail = (id: string) => {
		const detail = pathPositionsQuery.data?.find(p => p.id === id);
		if (detail) {
			setEditingDetailId(id);
			setEditedDetail({
				level: detail.level,
				sequenceInPath: detail.sequence_in_path || detail.level,
				pathSpecificDescription: detail.path_specific_description
			});
		}
	};

	const handleSaveDetail = (id: string) => {
		updateDetailMutation.mutate({
			id,
			level: editedDetail.level,
			sequenceInPath: editedDetail.sequenceInPath,
			pathSpecificDescription: editedDetail.pathSpecificDescription
		});
	};

	const handleCancelEdit = () => {
		setEditingDetailId(null);
		setEditedDetail({});
	};

	const handleRemovePrompt = (id: string) => {
		setConfirmRemoveId(id);
	};

	const handleRemovePosition = (id: string) => {
		removePositionMutation.mutate({ id });
	};

	// Sort positions by level
	const sortedPositions = [...(pathPositionsQuery.data || [])].sort((a, b) => {
		const levelDiff = a.level - b.level;
		if (levelDiff !== 0) return levelDiff;

		// If levels are the same, try to sort by sequence
		if (a.sequence_in_path && b.sequence_in_path) {
			return a.sequence_in_path - b.sequence_in_path;
		}

		return 0;
	});

	// Define columns for the ActionTable
	const columns: Column<PositionDetail>[] = [
		{
			key: "position",
			header: "Position",
			width: "w-[35%]",
			render: (detail) => (
				<span className="font-medium">
					{detail.positions?.name || "Unknown Position"}
				</span>
			)
		},
		{
			key: "level",
			header: "Level",
			width: "w-[15%]",
			render: (detail) => (
				editingDetailId === detail.id ? (
					<Input
						type="number"
						min={1}
						value={editedDetail.level}
						onChange={(e) => setEditedDetail({
							...editedDetail,
							level: parseInt(e.target.value),
							sequenceInPath: editedDetail.sequenceInPath === detail.level ? parseInt(e.target.value) : editedDetail.sequenceInPath
						})}
						className="w-20"
					/>
				) : (
					<span className="font-medium">{detail.level}</span>
				)
			)
		},
		{
			key: "description",
			header: "Path-Specific Description",
			width: "w-[50%]",
			render: (detail) => (
				editingDetailId === detail.id ? (
					<Textarea
						value={editedDetail.pathSpecificDescription || ""}
						onChange={(e) => setEditedDetail({
							...editedDetail,
							pathSpecificDescription: e.target.value
						})}
						className="h-20"
					/>
				) : (
					detail.path_specific_description ? (
						<div className="text-sm line-clamp-2">{detail.path_specific_description}</div>
					) : (
						<span className="text-muted-foreground italic">
							Using generic description
						</span>
					)
				)
			)
		}
	];

	// Get row actions for each row
	const getRowActions = (id: string) => {
		const isEditing = editingDetailId === id;

		if (isEditing) {
			return {
				edit: {
					label: "Save",
					onClick: () => handleSaveDetail(id)
				},
				delete: {
					label: "Cancel",
					onClick: () => handleCancelEdit()
				}
			};
		}

		return {
			edit: {
				label: "Edit",
				onClick: () => handleEditDetail(id)
			},
			delete: {
				label: "Remove",
				onClick: () => handleRemovePrompt(id)
			}
		};
	};

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">{pathName}</CardTitle>
							<CardDescription>
								Positions within this career path
							</CardDescription>
						</div>
						<Button
							onClick={() => setIsAssigning(true)}
							disabled={pathPositionsQuery.isLoading}
						>
							<Plus className="mr-2 h-4 w-4" />
							Assign Position
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					<ActionTable
						data={sortedPositions}
						columns={columns}
						isLoading={pathPositionsQuery.isLoading}
						rowActions={(detail) => {
							const isEditing = editingDetailId === detail.id;
							return {
								edit: {
									label: isEditing ? "Save" : "Edit",
									onClick: (id) => isEditing ? handleSaveDetail(id) : handleEditDetail(id)
								},
								delete: {
									label: isEditing ? "Cancel" : "Remove",
									onClick: (id) => isEditing ? handleCancelEdit() : handleRemovePrompt(id)
								}
							};
						}}
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
				</CardContent>
			</Card>

			{/* Assign Position Dialog */}
			<Dialog open={isAssigning} onOpenChange={setIsAssigning}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Assign Position to Path</DialogTitle>
						<DialogDescription>
							Add a position to the "{pathName}" career path
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