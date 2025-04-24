// src/app/hr/career-paths/CareerPaths.tsx
"use client";

import { useState } from "react";
import { useCareerPaths } from "../hooks/useCareerPaths";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CareersList } from "./CareersList";
import { CareerPathDialog } from "./CareerPathDialog";
import { toast } from "sonner";

interface CareerPathsProps {
	onSelectPath: (id: string | null) => void;
	selectedPathId: string | null;
}

export default function CareerPaths({ onSelectPath, selectedPathId }: CareerPathsProps) {
	// Dialog state
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	// Get career paths data and operations
	const {
		careerPaths,
		isLoading,
		error,
		deletePath,
		isDeleting
	} = useCareerPaths();

	// Handle opening the create dialog
	const handleAddPath = () => {
		setIsCreating(true);
	};

	// Handle opening the edit dialog
	const handleEditPath = (id: string) => {
		setEditingId(id);
	};

	// Handle opening the delete confirmation dialog
	const handleDeletePrompt = (id: string) => {
		setConfirmDeleteId(id);
	};

	// Handle confirming deletion
	const handleConfirmDelete = () => {
		if (!confirmDeleteId) return;

		deletePath({ id: confirmDeleteId }, {
			onSuccess: () => {
				toast.success("Career path deleted successfully");
				setConfirmDeleteId(null);
				if (selectedPathId === confirmDeleteId) {
					onSelectPath(null); // Deselect if deleted path was selected
				}
			},
			onError: (error) => {
				toast.error(`Failed to delete: ${error.message}`);
			}
		});
	};

	// Handle completion of create/edit operation
	const handleDialogComplete = () => {
		setIsCreating(false);
		setEditingId(null);
	};

	return (
		<>
			{/* Main careers list */}
			<CareersList
				careerPaths={careerPaths}
				isLoading={isLoading}
				selectedPathId={selectedPathId}
				onSelectPath={onSelectPath}
				onAddPath={handleAddPath}
				onEditPath={handleEditPath}
				onDeletePath={handleDeletePrompt}
			/>

			{/* Create/Edit Career Path Dialogs */}
			<CareerPathDialog
				open={isCreating}
				mode="create"
				onOpenChange={setIsCreating}
				onComplete={handleDialogComplete}
			/>

			<CareerPathDialog
				open={!!editingId}
				mode="edit"
				pathId={editingId || undefined}
				onOpenChange={(open) => !open && setEditingId(null)}
				onComplete={handleDialogComplete}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!confirmDeleteId}
				onOpenChange={(open) => !open && setConfirmDeleteId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this career path? This action cannot be undone.
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