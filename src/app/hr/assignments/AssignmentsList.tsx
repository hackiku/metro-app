// src/app/hr/assignments/AssignmentsList.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
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
			...editedDetail
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

	// Sort positions by level and then by sequence_in_path if available
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
			width: "w-[30%]",
			render: (detail) => (
				<span className="font-medium">
					{detail.positions?.name || "Unknown Position"}
				</span>
			)
		},
		{
			key: "level",
			header: "Level",
			width: "w-[10%]",
			render: (detail) => (
				editingDetailId === detail.id ? (
					<Input
						type="number"
						min={1}
						value={editedDetail.level}
						onChange={(e) => setEditedDetail({
							...editedDetail,
							level: parseInt(e.target.value)
						})}
						className="w-20"
					/>
				) : (
					<span>{detail.level}</span>
				)
			)
		},
		{
			key: "sequence",
			header: "Sequence",
			width: "w-[15%]",
			render: (detail) => (
				editingDetailId === detail.id ? (
					<Input
						type="number"
						min={1}
						value={editedDetail.sequenceInPath}
						onChange={(e) => setEditedDetail({
							...editedDetail,
							sequenceInPath: parseInt(e.target.value)
						})}
						className="w-20"
					/>
				) : (
					detail.sequence_in_path ? (
						<span>{detail.sequence_in_path}</span>
					) : (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<span className="flex items-center text-muted-foreground">
										<Info className="h-3 w-3 mr-1" />
										Same as level
									</span>
								</TooltipTrigger>
								<TooltipContent>
									<p>No specific sequence set, defaulting to level value</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)
				)
			)
		},
		{
			key: "description",
			header: "Path-Specific Description",
			width: "w-[45%]",
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

	// Custom row actions for the ActionTable
	const getRowActions = (detail: PositionDetail) => {
		if (editingDetailId === detail.id) {
			return {
				edit: {
					label: "Save",
					onClick: () => handleSaveDetail(detail.id)
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
				onClick: () => handleEditDetail(detail.id)
			},
			delete: {
				label: "Remove",
				onClick: () => handleRemovePrompt(detail.id)
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
						rowActions={{
							edit: {
								label: "Edit",
								onClick: (id) => handleEditDetail(id)
							},
							delete: {
								label: "Remove",
								onClick: (id) => handleRemovePrompt(id)
							}
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

					{!pathPositionsQuery.isLoading && sortedPositions.length > 0 && (
						<div className="mt-4 bg-muted/50 p-3 rounded-md flex items-start gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium">About Levels and Sequences</p>
								<p className="text-muted-foreground mt-1">
									<strong>Level</strong> represents the seniority or pay grade of a position.{" "}
									<strong>Sequence</strong> determines the position's order within the same level for visualization.
									If sequence is not specified, it will use the level value.
								</p>
							</div>
						</div>
					)}
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