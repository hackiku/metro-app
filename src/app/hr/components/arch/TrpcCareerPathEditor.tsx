"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
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
import { Pencil, Plus, Save, X, Trash2, Loader2, Check } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";

interface TrpcCareerPathEditorProps {
	selectedCareerPathId: string | null;
	onSelect: (id: string | null) => void;
}

/**
 * Career Path Editor component built with tRPC
 * 
 * This component showcases several tRPC and React Query features:
 * 1. Data fetching with automatic loading states
 * 2. Mutations with optimistic updates
 * 3. Cache invalidation to keep data fresh
 * 4. Type safety throughout the component
 */
export function TrpcCareerPathEditor({
	selectedCareerPathId,
	onSelect,
}: TrpcCareerPathEditorProps) {
	const { currentOrgId } = useSession();
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
		name: "",
		description: null,
		color: "#4299E1", // Default blue color
	});
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch career paths with tRPC query
	// This is where React Query's magic happens - automatic caching, 
	// deduplication of requests, and handling loading/error states
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Fetch details for selected path if any
	const selectedPathQuery = api.career.getPathById.useQuery(
		{ id: selectedCareerPathId! },
		{
			enabled: !!selectedCareerPathId,
			// Don't refetch this data too often since it rarely changes
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Set up mutations with React Query
	// These handle the server communication and cache updates
	const createMutation = api.career.createPath.useMutation({
		// When mutation succeeds, update the UI immediately
		onSuccess: (newPath) => {
			setNewPath({ name: "", description: null, color: "#4299E1" });
			setIsCreating(false);
			// Invalidate the paths query to refresh the data
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
			// Show success message
			setShowSuccessMessage(true);
			setTimeout(() => setShowSuccessMessage(false), 3000);
		},
	});

	const updateMutation = api.career.updatePath.useMutation({
		onSuccess: () => {
			setEditingId(null);
			setEditedValues({});
			// Invalidate both queries to ensure data consistency
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
			if (selectedCareerPathId) {
				utils.career.getPathById.invalidate({ id: selectedCareerPathId });
			}
			// Show success message
			setShowSuccessMessage(true);
			setTimeout(() => setShowSuccessMessage(false), 3000);
		},
	});

	const deleteMutation = api.career.deletePath.useMutation({
		onSuccess: (_, variables) => {
			setConfirmDeleteId(null);
			// If we deleted the selected path, clear the selection
			if (selectedCareerPathId === variables.id) {
				onSelect(null);
			}
			// Invalidate the paths query to refresh the data
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
		},
	});

	// Handler functions
	const handleEdit = (id: string, name: string, description: string | null, color: string | null) => {
		setEditingId(id);
		setEditedValues({ name, description, color });
	};

	const handleSave = (id: string) => {
		updateMutation.mutate({
			id,
			...editedValues,
		});
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditedValues({});
		setIsCreating(false);
	};

	const handleCreateNew = () => {
		if (newPath.name.trim() === "") {
			alert("Name is required");
			return;
		}

		createMutation.mutate({
			organizationId: currentOrgId!,
			name: newPath.name,
			description: newPath.description,
			color: newPath.color,
		});
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
	};

	// Filter paths if a specific one is selected
	const displayPaths = selectedCareerPathId
		? pathsQuery.data?.filter((p) => p.id === selectedCareerPathId) || []
		: pathsQuery.data || [];

	return (
		<>
			{/* Success Message Toast */}
			{showSuccessMessage && (
				<div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded shadow-lg flex items-center z-50">
					<Check className="h-5 w-5 mr-2" />
					Changes saved successfully
				</div>
			)}

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">
								{selectedCareerPathId
									? selectedPathQuery.data?.name || "Career Path"
									: "Career Paths"}
							</CardTitle>
							<CardDescription>
								{selectedCareerPathId
									? "Manage details for this career path"
									: "Create and manage career paths"}
							</CardDescription>
						</div>
						{selectedCareerPathId && (
							<Button variant="outline" size="sm" onClick={() => onSelect(null)}>
								View All Paths
							</Button>
						)}
					</div>
				</CardHeader>

				<CardContent>
					{/* Table of career paths */}
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
								{/* Existing career paths */}
								{displayPaths.map((path) => (
									<TableRow key={path.id}>
										<TableCell>
											{editingId === path.id ? (
												<Input
													value={editedValues.name || ""}
													onChange={(e) =>
														setEditedValues({ ...editedValues, name: e.target.value })
													}
													className="max-w-xs"
												/>
											) : (
												<span
													className="font-medium hover:text-primary cursor-pointer"
													onClick={() => onSelect(path.id)}
												>
													{path.name}
												</span>
											)}
										</TableCell>
										<TableCell>
											{editingId === path.id ? (
												<Textarea
													value={editedValues.description || ""}
													onChange={(e) =>
														setEditedValues({
															...editedValues,
															description: e.target.value,
														})
													}
													className="max-w-xs h-20"
												/>
											) : (
												path.description || "-"
											)}
										</TableCell>
										<TableCell>
											{editingId === path.id ? (
												<Input
													type="color"
													value={editedValues.color || "#000000"}
													onChange={(e) =>
														setEditedValues({
															...editedValues,
															color: e.target.value,
														})
													}
													className="w-16 h-8"
												/>
											) : (
												<div
													className="w-6 h-6 rounded-full"
													style={{ backgroundColor: path.color || "#cccccc" }}
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
															onClick={() =>
																handleEdit(
																	path.id,
																	path.name,
																	path.description,
																	path.color
																)
															}
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
												onChange={(e) =>
													setNewPath({ ...newPath, name: e.target.value })
												}
												placeholder="Path name"
												className="max-w-xs"
											/>
										</TableCell>
										<TableCell>
											<Textarea
												value={newPath.description || ""}
												onChange={(e) =>
													setNewPath({
														...newPath,
														description: e.target.value,
													})
												}
												placeholder="Description"
												className="max-w-xs h-20"
											/>
										</TableCell>
										<TableCell>
											<Input
												type="color"
												value={newPath.color}
												onChange={(e) =>
													setNewPath({ ...newPath, color: e.target.value })
												}
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
				</CardContent>

				<CardFooter className="flex justify-between">
					<div className="text-xs text-muted-foreground">
						{pathsQuery.data ? `${displayPaths.length} paths` : ''}
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
			</Card>

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
		</>
	);
}