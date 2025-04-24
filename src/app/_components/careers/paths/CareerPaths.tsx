// src/app/hr/career-paths/CareerPaths.tsx

"use client";

import { useState } from "react";
import { useCareerPaths } from "../hooks/useCareerPaths";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Pencil, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { CareerPathForm } from "./CareerPathForm";
import { toast } from "sonner";
import type { CareerPath } from "~/types/compass";

interface CareerPathsProps {
	onSelectPath: (id: string | null) => void;
	selectedPathId: string | null;
}

export function CareerPaths({ onSelectPath, selectedPathId }: CareerPathsProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	const {
		careerPaths,
		isLoading,
		error,
		deletePath,
		isDeleting
	} = useCareerPaths();

	// Handle row selection - toggle selection if clicked again
	const handleRowClick = (id: string) => {
		if (selectedPathId === id) {
			onSelectPath(null); // Deselect if already selected
		} else {
			onSelectPath(id); // Select new path
		}
	};

	// Handle delete action
	const handleDelete = (id: string) => {
		deletePath({ id }, {
			onSuccess: () => {
				toast.success("Career path deleted successfully");
				setConfirmDeleteId(null);
				if (selectedPathId === id) {
					onSelectPath(null); // Deselect if deleted path was selected
				}
			},
			onError: (error) => {
				toast.error(`Failed to delete: ${error.message}`);
			}
		});
	};

	// Prevent event bubbling for action buttons
	const handleButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

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
						<div className="rounded-md border">
							<Table>
								<TableHeader className="bg-muted/50">
									<TableRow>
										<TableHead className="w-[300px]">Name</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="w-[100px]">Color</TableHead>
										<TableHead className="w-[150px] text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{careerPaths.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
												No career paths available. Create your first one!
											</TableCell>
										</TableRow>
									) : (
										careerPaths.map((path) => (
											<TableRow
												key={path.id}
												className={`cursor-pointer ${selectedPathId === path.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
												onClick={() => handleRowClick(path.id)}
											>
												<TableCell className="font-medium">
													<div className="flex items-center">
														{selectedPathId === path.id ?
															<ChevronDown className="mr-1 h-4 w-4" /> :
															<ChevronRight className="mr-1 h-4 w-4" />
														}
														{path.name}
													</div>
												</TableCell>
												<TableCell className="max-w-md truncate">
													{path.description || "-"}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div
															className="w-6 h-6 rounded-full border"
															style={{ backgroundColor: path.color || "#cccccc" }}
														/>
													</div>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={(e) => {
																handleButtonClick(e);
																setEditingId(path.id);
															}}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={(e) => {
																handleButtonClick(e);
																setConfirmDeleteId(path.id);
															}}
														>
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Career Path Dialogs */}
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