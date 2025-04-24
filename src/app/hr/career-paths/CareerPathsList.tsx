// src/app/hr/career-paths/CareerPathsList.tsx
"use client";

import { useState } from "react";
import { useCareerPaths } from "../hooks/useCareerPaths";
import { ExpandableTable } from "~/components/tables/ExpandableTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { CareerPathForm } from "./CareerPathForm";
import { toast } from "sonner";

interface CareerPathsListProps {
	onSelectPath: (id: string) => void;
}

export function CareerPathsList({ onSelectPath }: CareerPathsListProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	const {
		careerPaths,
		isLoading,
		error,
		createPath,
		updatePath,
		deletePath,
		isCreating: isCreatingPath,
		isUpdating,
		isDeleting
	} = useCareerPaths();

	// Table columns configuration
	const columns = [
		{ key: "name", header: "Name" },
		{ key: "description", header: "Description" },
		{ key: "color", header: "Color" }
	];

	// Handle delete action
	const handleDelete = (id: string) => {
		deletePath({ id }, {
			onSuccess: () => {
				toast.success("Career path deleted successfully");
				setConfirmDeleteId(null);
			},
			onError: (error) => {
				toast.error(`Failed to delete: ${error.message}`);
			}
		});
	};

	// Render expanded content for each row
	const renderExpanded = (path: any) => (
		<div className="p-4 space-y-4">
			<div className="flex gap-2">
				<Button variant="outline" onClick={() => setEditingId(path.id)}>
					<Pencil className="mr-2 h-4 w-4" /> Edit Path
				</Button>
				<Button variant="outline" onClick={() => onSelectPath(path.id)}>
					<Eye className="mr-2 h-4 w-4" /> Manage Positions
				</Button>
				<Button
					variant="outline"
					className="text-destructive"
					onClick={() => setConfirmDeleteId(path.id)}
				>
					<Trash2 className="mr-2 h-4 w-4" /> Delete
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<h3 className="text-sm font-medium">Description</h3>
					<p className="text-sm text-muted-foreground">{path.description || "No description provided."}</p>
				</div>
				<div>
					<h3 className="text-sm font-medium">Color</h3>
					<div className="flex items-center gap-2 mt-1">
						<div
							className="w-6 h-6 rounded-full border"
							style={{ backgroundColor: path.color || "#cccccc" }}
						/>
						<span className="text-sm">{path.color || "Default"}</span>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">Career Paths</CardTitle>
							<CardDescription>
								Create and manage career paths
							</CardDescription>
						</div>
						<Button
							onClick={() => setIsCreating(true)}
							disabled={isLoading}
						>
							<Plus className="mr-2 h-4 w-4" />
							New Career Path
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					{isLoading ? (
						<div className="h-40 flex items-center justify-center">
							<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
						</div>
					) : error ? (
						<div className="p-4 text-destructive bg-destructive/10 rounded-md">
							Error loading career paths: {error.message}
						</div>
					) : (
						<ExpandableTable
							data={careerPaths}
							columns={columns}
							renderExpanded={renderExpanded}
						/>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Forms in Dialogs */}
			<Dialog open={isCreating} onOpenChange={setIsCreating}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create Career Path</DialogTitle>
						<DialogDescription>
							Add a new career path to your organization
						</DialogDescription>
					</DialogHeader>
					<CareerPathForm
						onComplete={() => setIsCreating(false)}
						mode="create"
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!editingId}
				onOpenChange={(open) => !open && setEditingId(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Career Path</DialogTitle>
						<DialogDescription>
							Update career path details
						</DialogDescription>
					</DialogHeader>
					{editingId && (
						<CareerPathForm
							pathId={editingId}
							onComplete={() => setEditingId(null)}
							mode="edit"
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
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
							onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
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