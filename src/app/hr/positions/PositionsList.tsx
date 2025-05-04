// src/app/hr/positions/PositionsList.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { PositionForm } from "./PositionForm";
import { ActionTable, type Column } from "~/components/tables/ActionTable";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { usePositions } from "~/hooks/usePositions";

interface Position {
	id: string;
	name: string;
	base_description: string | null;
}

interface PositionsListProps {
	onPositionSelect?: (id: string) => void;
}

export function PositionsList({ onPositionSelect }: PositionsListProps) {
	const { currentOrgId } = useSession();
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Get positions data and operations
	const {
		positions,
		isLoading,
		error,
		deletePosition,
		isDeleting
	} = usePositions();

	// Filter positions based on search query
	const filteredPositions = positions.filter(position =>
		position.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		position.base_description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Handle position actions
	const handleAddPosition = () => {
		setIsCreating(true);
	};

	const handleEditPosition = (id: string) => {
		setEditingId(id);
	};

	const handleDeletePrompt = (id: string) => {
		setConfirmDeleteId(id);
	};

	const handleConfirmDelete = () => {
		if (!confirmDeleteId) return;

		deletePosition({ id: confirmDeleteId }, {
			onSuccess: () => {
				toast.success("Position deleted successfully");
				setConfirmDeleteId(null);
			},
			onError: (error) => {
				toast.error(`Failed to delete: ${error.message}`);
			}
		});
	};

	// Define columns for the ActionTable
	const columns: Column<Position>[] = [
		{
			key: "name",
			header: "Position Name",
			width: "w-[40%]",
			render: (position) => (
				<div className="font-medium">{position.name}</div>
			)
		},
		{
			key: "description",
			header: "Description",
			width: "w-[60%]",
			render: (position) => (
				<div className="text-sm text-muted-foreground line-clamp-2">
					{position.base_description || "No description provided."}
				</div>
			)
		}
	];

	return (
		<>
			<div className="mb-4 flex justify-between items-center">
				<div className="relative w-64">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search positions..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-8 h-9 text-sm"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1 h-7 w-7"
							onClick={() => setSearchQuery("")}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>

				<Button onClick={handleAddPosition}>
					<Plus className="mr-2 h-4 w-4" />
					New Position
				</Button>
			</div>

			<ActionTable
				data={filteredPositions}
				columns={columns}
				isLoading={isLoading}
				onRowClick={onPositionSelect}
				rowActions={{
					edit: {
						label: "Edit",
						onClick: handleEditPosition
					},
					delete: {
						label: "Delete",
						onClick: handleDeletePrompt
					}
				}}
				primaryAction={{
					label: "Add New Position",
					onClick: handleAddPosition
				}}
				emptyState={{
					title: searchQuery
						? "No Positions Match Your Search"
						: "No Positions Yet",
					description: searchQuery
						? "Try a different search term or clear the search"
						: "Create position titles that can be assigned to career paths",
					action: {
						label: "Create Your First Position",
						onClick: handleAddPosition
					}
				}}
			/>

			{/* Create/Edit Position Dialog */}
			<Dialog
				open={isCreating || !!editingId}
				onOpenChange={(open) => {
					if (!open) {
						setIsCreating(false);
						setEditingId(null);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{isCreating ? "Create Position" : "Edit Position"}
						</DialogTitle>
						<DialogDescription>
							{isCreating
								? "Add a new position that can be assigned to career paths"
								: "Update position details"
							}
						</DialogDescription>
					</DialogHeader>

					<PositionForm
						positionId={editingId || undefined}
						onComplete={() => {
							setIsCreating(false);
							setEditingId(null);
						}}
						mode={isCreating ? "create" : "edit"}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Position Confirmation Dialog */}
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
							onClick={handleConfirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
									Deleting...
								</>
							) : (
								'Delete'
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}