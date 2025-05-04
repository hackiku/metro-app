// src/app/hr/jobs/PositionTable.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "~/components/ui/table";
import {
	Plus, Search, X, Pencil, Trash2, GripVertical, Save, RotateCcw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

interface PositionTableProps {
	selectedPathId: string | null;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onAddPosition: () => void;
	onEditPosition: (id: string) => void;
	onAssignPosition: () => void;
	onSelectPosition: (id: string) => void;
	onToggleReorderMode: () => void;
	onPositionReorder: (changes: Array<{ id: string, level: number, sequence: number }>) => void;
	onSaveChanges: () => void;
	reorderMode: boolean;
	hasChanges: boolean;
}

export function PositionTable({
	selectedPathId,
	searchQuery,
	onSearchChange,
	onAddPosition,
	onEditPosition,
	onAssignPosition,
	onSelectPosition,
	onToggleReorderMode,
	onPositionReorder,
	onSaveChanges,
	reorderMode,
	hasChanges
}: PositionTableProps) {
	const { currentOrganization } = useOrganization();
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [positions, setPositions] = useState<any[]>([]);

	// Get utils for cache invalidation
	const utils = api.useUtils();

	// Query positions based on selected path
	const allPositionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	// Get positions for selected path
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrganization?.id!,
			careerPathId: selectedPathId!
		},
		{ enabled: !!currentOrganization?.id && !!selectedPathId }
	);

	// Set up delete mutation
	const deletePositionMutation = api.position.delete.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrganization?.id! });
			toast.success("Position deleted successfully");
			setConfirmDeleteId(null);
		},
		onError: (error) => {
			toast.error(`Failed to delete: ${error.message}`);
		}
	});

	// Set up remove from path mutation
	const removeFromPathMutation = api.position.removeFromPath.useMutation({
		onSuccess: () => {
			if (selectedPathId) {
				utils.position.getByCareerPath.invalidate({
					organizationId: currentOrganization?.id!,
					careerPathId: selectedPathId
				});
			}
			toast.success("Position removed from path");
		},
		onError: (error) => {
			toast.error(`Failed to remove: ${error.message}`);
		}
	});

	// Process and filter positions
	useEffect(() => {
		let processedPositions = [];

		if (selectedPathId && pathPositionsQuery.data) {
			// Show positions in this path
			processedPositions = pathPositionsQuery.data.map(detail => ({
				id: detail.id,
				positionId: detail.positions?.id,
				name: detail.positions?.name || 'Unknown Position',
				description: detail.path_specific_description || detail.positions?.base_description || '',
				level: detail.level,
				sequence: detail.sequence_in_path || detail.level,
				isInPath: true
			}));

			// Sort by level and sequence
			processedPositions.sort((a, b) => {
				if (a.level !== b.level) return a.level - b.level;
				return a.sequence - b.sequence;
			});
		} else if (allPositionsQuery.data) {
			// Show all positions
			processedPositions = allPositionsQuery.data.map(pos => ({
				id: pos.id,
				positionId: pos.id,
				name: pos.name,
				description: pos.base_description || '',
				isInPath: false
			}));
		}

		// Filter by search query
		if (searchQuery) {
			processedPositions = processedPositions.filter(pos =>
				pos.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				pos.description.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		setPositions(processedPositions);
	}, [selectedPathId, allPositionsQuery.data, pathPositionsQuery.data, searchQuery]);

	// Handle delete confirmation
	const handleDeletePosition = () => {
		if (!confirmDeleteId) return;
		deletePositionMutation.mutate({ id: confirmDeleteId });
	};

	// Handle removing from path
	const handleRemoveFromPath = (id: string) => {
		if (confirm("Are you sure you want to remove this position from the path?")) {
			removeFromPathMutation.mutate({ id });
		}
	};

	// Handle drag events
	const handleDragStart = (e: React.DragEvent, id: string) => {
		setDraggingId(id);
		e.dataTransfer.setData("positionId", id);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent, targetId: string) => {
		e.preventDefault();
		const sourceId = e.dataTransfer.getData("positionId");

		if (sourceId === targetId) return;

		const sourceIndex = positions.findIndex(p => p.id === sourceId);
		const targetIndex = positions.findIndex(p => p.id === targetId);

		if (sourceIndex < 0 || targetIndex < 0) return;

		const newPositions = [...positions];
		const [movedItem] = newPositions.splice(sourceIndex, 1);
		newPositions.splice(targetIndex, 0, movedItem);

		// Update level and sequence for all items
		const updatedPositions = newPositions.map((position, index) => {
			const level = Math.floor(index / 3) + 1; // Simple algorithm: 3 positions per level
			const sequence = (index % 3) + 1;        // Position within level
			return { ...position, level, sequence };
		});

		setPositions(updatedPositions);

		// Calculate changes for reordering
		const changes = updatedPositions.filter(p =>
			p.level !== positions[positions.findIndex(orig => orig.id === p.id)]?.level ||
			p.sequence !== positions[positions.findIndex(orig => orig.id === p.id)]?.sequence
		).map(p => ({
			id: p.id,
			level: p.level,
			sequence: p.sequence
		}));

		if (changes.length > 0) {
			onPositionReorder(changes);
		}

		setDraggingId(null);
	};

	const isLoading = (!selectedPathId && allPositionsQuery.isLoading) ||
		(selectedPathId && pathPositionsQuery.isLoading);

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<div className="w-64 h-10 bg-muted rounded-md animate-pulse" />
					<div className="h-10 w-28 bg-muted rounded-md animate-pulse" />
				</div>
				<div className="border rounded-md">
					<div className="h-12 border-b bg-muted/50 animate-pulse" />
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-16 border-b animate-pulse bg-muted/30" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Top action bar */}
			<div className="flex justify-between items-center">
				<div className="relative w-64">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search positions..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-8"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1 h-7 w-7"
							onClick={() => onSearchChange("")}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>

				<div className="flex items-center gap-2">
					{selectedPathId && (
						<>
							{reorderMode ? (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={onToggleReorderMode}
										disabled={hasChanges}
									>
										<RotateCcw className="mr-2 h-4 w-4" />
										Cancel
									</Button>
									<Button
										size="sm"
										onClick={onSaveChanges}
										disabled={!hasChanges}
									>
										<Save className="mr-2 h-4 w-4" />
										Save Order
									</Button>
								</>
							) : (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={onToggleReorderMode}
									>
										<GripVertical className="mr-2 h-4 w-4" />
										Reorder
									</Button>
									<Button
										size="sm"
										onClick={onAssignPosition}
									>
										<Plus className="mr-2 h-4 w-4" />
										Assign Position
									</Button>
								</>
							)}
						</>
					)}

					{!selectedPathId && (
						<Button onClick={onAddPosition}>
							<Plus className="mr-2 h-4 w-4" />
							Add Position
						</Button>
					)}
				</div>
			</div>

			{/* Positions table */}
			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							{reorderMode && <TableHead className="w-10"></TableHead>}
							<TableHead>Position Name</TableHead>
							<TableHead className="w-[45%]">Description</TableHead>
							{selectedPathId && <TableHead className="w-20">Level</TableHead>}
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{positions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={selectedPathId ? (reorderMode ? 4 : 3) : (reorderMode ? 3 : 2)}
									className="h-24 text-center"
								>
									<div className="flex flex-col items-center justify-center text-muted-foreground">
										{selectedPathId ? (
											<>
												<p>No positions assigned to this career path</p>
												<Button
													variant="outline"
													size="sm"
													className="mt-2"
													onClick={onAssignPosition}
												>
													<Plus className="mr-2 h-4 w-4" />
													Assign Position
												</Button>
											</>
										) : searchQuery ? (
											<p>No positions match your search</p>
										) : (
											<>
												<p>No positions created yet</p>
												<Button
													variant="outline"
													size="sm"
													className="mt-2"
													onClick={onAddPosition}
												>
													<Plus className="mr-2 h-4 w-4" />
													Add Position
												</Button>
											</>
										)}
									</div>
								</TableCell>
							</TableRow>
						) : (
							positions.map((position) => (
								<TableRow
									key={position.id}
									className={`${draggingId === position.id ? 'opacity-50' : ''} ${reorderMode ? 'cursor-grab' : ''}`}
									onClick={() => !reorderMode && onSelectPosition(position.positionId)}
									draggable={reorderMode}
									onDragStart={reorderMode ? (e) => handleDragStart(e, position.id) : undefined}
									onDragOver={reorderMode ? handleDragOver : undefined}
									onDrop={reorderMode ? (e) => handleDrop(e, position.id) : undefined}
								>
									{reorderMode && (
										<TableCell>
											<GripVertical className="h-5 w-5 text-muted-foreground" />
										</TableCell>
									)}
									<TableCell>
										<div className="font-medium">{position.name}</div>
									</TableCell>
									<TableCell>
										<div className="text-sm text-muted-foreground line-clamp-2">
											{position.description || "No description provided"}
										</div>
									</TableCell>
									{selectedPathId && (
										<TableCell>
											<Badge variant="outline">L{position.level}</Badge>
											{position.sequence !== position.level && (
												<span className="ml-1 text-xs text-muted-foreground">({position.sequence})</span>
											)}
										</TableCell>
									)}
									<TableCell className="text-right">
										<div className="flex justify-end space-x-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={(e) => {
													e.stopPropagation();
													onEditPosition(position.positionId);
												}}
											>
												<Pencil className="h-4 w-4" />
											</Button>

											{selectedPathId ? (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveFromPath(position.id);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											) : (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														setConfirmDeleteId(position.positionId);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Delete confirmation dialog */}
			<Dialog
				open={!!confirmDeleteId}
				onOpenChange={(open) => !open && setConfirmDeleteId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this position? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setConfirmDeleteId(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeletePosition}
							disabled={deletePositionMutation.isPending}
						>
							{deletePositionMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}