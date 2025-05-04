// src/app/hr/career-paths/CareerPaths.tsx
"use client";

import { useState } from "react";
import { useCareerPaths } from "~/hooks/useCareerPaths";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CareersList } from "./CareersList";
import { SimpleCards } from "./SimpleCards";
import { DetailCards } from "./DetailCards";
import { ViewSelector } from "./ViewSelector";
import { CareerPathDialog } from "./CareerPathDialog";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";

interface CareerPathsProps {
	onSelectPath: (id: string | null) => void;
	selectedPathId: string | null;
}

export default function CareerPaths({ onSelectPath, selectedPathId }: CareerPathsProps) {
	// View mode state - "table", "simple", or "details"
	const [viewMode, setViewMode] = useState<"table" | "simple" | "details">("table");

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

	// Handle view mode change
	const handleViewModeChange = (mode: "table" | "simple" | "details") => {
		setViewMode(mode);
	};

	return (
		<>
			<Card>
				<CardContent className="pt-6">
					{/* View selector header */}
					<ViewSelector
						viewMode={viewMode}
						onViewModeChange={handleViewModeChange}
						onAddPath={handleAddPath}
						careerPathCount={careerPaths.length}
					/>

					{/* Error message */}
					{error && (
						<div className="bg-destructive/10 p-4 mb-4 rounded-md text-destructive">
							<p>Error loading career paths: {error.message}</p>
						</div>
					)}

					{/* Render view based on selected mode */}
					{viewMode === "simple" && (
						<SimpleCards
							careerPaths={careerPaths}
							selectedPathId={selectedPathId}
							onSelectPath={onSelectPath}
							isLoading={isLoading}
						/>
					)}

					{viewMode === "details" && (
						<DetailCards
							careerPaths={careerPaths}
							selectedPathId={selectedPathId}
							onSelectPath={onSelectPath}
							isLoading={isLoading}
						/>
					)}

					{viewMode === "table" && (
						<CareersList
							careerPaths={careerPaths}
							isLoading={isLoading}
							selectedPathId={selectedPathId}
							onSelectPath={onSelectPath}
							onAddPath={handleAddPath}
							onEditPath={handleEditPath}
							onDeletePath={handleDeletePrompt}
						/>
					)}
				</CardContent>
			</Card>

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