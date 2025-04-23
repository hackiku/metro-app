// src/app/hr/components/TrpcCareerPathsTable.tsx
"use client";

import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Pencil, Plus, Save, X, Eye, Trash2, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "~/components/ui/dialog";

export function TrpcCareerPathsTable() {
	// Fixed organization ID (in a real app, you'd get this from a session context)
	const organizationId = 'a73148de-90e1-4f0e-955d-9790c131e13c'; // Veenie org ID

	// Local state for table editing
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [editedValues, setEditedValues] = useState<{
		name?: string;
		description?: string | null;
		color?: string | null;
	}>({});
	const [newPath, setNewPath] = useState<{
		name: string;
		description: string | null;
		color: string;
	}>({
		name: '',
		description: null,
		color: '#4299E1', // Default blue color
	});
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch career paths
	const pathsQuery = api.career.getPaths.useQuery({ organizationId });

	// Mutations
	const createMutation = api.career.createPath.useMutation({
		onSuccess: () => {
			// Reset form and refresh data
			setNewPath({ name: '', description: null, color: '#4299E1' });
			setIsCreating(false);
			utils.career.getPaths.invalidate({ organizationId });
		}
	});

	const updateMutation = api.career.updatePath.useMutation({
		onSuccess: () => {
			// Clear editing state and refresh data
			setEditingId(null);
			setEditedValues({});
			utils.career.getPaths.invalidate({ organizationId });
		}
	});

	const deleteMutation = api.career.deletePath.useMutation({
		onSuccess: () => {
			// Close confirmation dialog and refresh data
			setConfirmDeleteId(null);
			utils.career.getPaths.invalidate({ organizationId });
		}
	});

	// Handler functions
	const handleEdit = (id: string, name: string, description: string | null, color: string | null) => {
		setEditingId(id);
		setEditedValues({ name, description, color });
	};

	const handleSave = (id: string) => {
		updateMutation.mutate({
			id,
			...editedValues
		});
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditedValues({});
		setIsCreating(false);
	};

	const handleCreateNew = () => {
		if (newPath.name.trim() === '') {
			alert('Name is required');
			return;
		}

		createMutation.mutate({
			organizationId,
			name: newPath.name,
			description: newPath.description,
			color: newPath.color
		});
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Career Paths</CardTitle>
				<CardDescription>
					Manage career paths within the organization
				</CardDescription>
			</CardHeader>

			<CardContent>
				{/* Loading state */}
				{pathsQuery.isLoading ? (
					<div className="flex items-center justify-center h-40">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						<span className="ml-2 text-muted-foreground">Loading career paths...</span>
					</div>
				) : pathsQuery.error ? (
					// Error state
					<div className="bg-destructive/10 p-4 rounded-md text-destructive">
						<p>Error loading career paths: {pathsQuery.error.message}</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-2"
							onClick={() => pathsQuery.refetch()}
						>
							Retry
						</Button>
					</div>
				) : (
					// Data table
					<div className="rounded-md border">
						<Table>
							<TableHeader className="bg-muted/50">
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Color</TableHead>
									<TableHead className="w-24">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{/* Existing paths */}
								{pathsQuery.data?.map((path) => (
									<TableRow key={path.id}>
										<TableCell>
											{editingId === path.id ? (
												<Input
													value={editedValues.name || ''}
													onChange={(e) => setEditedValues({ ...editedValues, name: e.target.value })}
													className="max-w-xs"
												/>
											) : (
												path.name
											)}
										</TableCell>
										<TableCell>
											{editingId === path.id ? (
												<Input
													value={editedValues.description || ''}
													onChange={(e) => setEditedValues({ ...editedValues, description: e.target.value })}
													className="max-w-xs"
												/>
											) : (
												path.description || "-"
											)}
										</TableCell>
										<TableCell>
											{editingId === path.id ? (
												<Input
													type="color"
													value={editedValues.color || '#000000'}
													onChange={(e) => setEditedValues({ ...editedValues, color: e.target.value })}
													className="w-16 h-8"
												/>
											) : (
												<div
													className="w-6 h-6 rounded-full"
													style={{ backgroundColor: path.color || '#cccccc' }}
												/>
											)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{editingId === path.id ? (
													<>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleSave(path.id)}
															disabled={updateMutation.isPending}
														>
															{updateMutation.isPending ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Save className="h-4 w-4" />
															)}
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={handleCancel}
														>
															<X className="h-4 w-4" />
														</Button>
													</>
												) : (
													<>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleEdit(path.id, path.name, path.description, path.color)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setConfirmDeleteId(path.id)}
														>
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}

								{/* New path form row */}
								{isCreating && (
									<TableRow>
										<TableCell>
											<Input
												value={newPath.name}
												onChange={(e) => setNewPath({ ...newPath, name: e.target.value })}
												placeholder="Path name"
												className="max-w-xs"
											/>
										</TableCell>
										<TableCell>
											<Input
												value={newPath.description || ''}
												onChange={(e) => setNewPath({ ...newPath, description: e.target.value })}
												placeholder="Description"
												className="max-w-xs"
											/>
										</TableCell>
										<TableCell>
											<Input
												type="color"
												value={newPath.color}
												onChange={(e) => setNewPath({ ...newPath, color: e.target.value })}
												className="w-16 h-8"
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={handleCreateNew}
													disabled={createMutation.isPending}
												>
													{createMutation.isPending ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Save className="h-4 w-4" />
													)}
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={handleCancel}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex justify-between">
				<div className="text-xs text-muted-foreground">
					{pathsQuery.data ? `${pathsQuery.data.length} paths` : ''}
				</div>
				{!isCreating && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsCreating(true)}
						disabled={pathsQuery.isLoading}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Path
					</Button>
				)}
			</CardFooter>

			{/* Delete confirmation dialog */}
			<Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this career path? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
						<Button
							variant="destructive"
							onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								'Delete'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}