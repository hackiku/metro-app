// src/app/hr/components/CareerPathTable.tsx

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
import { Pencil, Plus, Loader2, Trash2, Eye } from "lucide-react";
import { CareerPathForm } from "./CareerPathForm";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

interface CareerPathTableProps {
	onSelectPath: (id: string) => void;
}

/**
 * Career Path Table component
 * 
 * Displays a table of career paths and allows:
 * - Creating new paths
 * - Editing existing paths
 * - Deleting paths
 * - Selecting a path for detailed view
 */
export function CareerPathTable({ onSelectPath }: CareerPathTableProps) {
	const { currentOrgId } = useSession();
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch career paths with tRPC query
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Set up delete mutation
	const deleteMutation = api.career.deletePath.useMutation({
		onSuccess: () => {
			setConfirmDeleteId(null);
			// Invalidate the paths query to refresh the data
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
		},
	});

	// Handler for deleting a path
	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
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
							disabled={pathsQuery.isLoading}
						>
							<Plus className="mr-2 h-4 w-4" />
							New Career Path
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					{pathsQuery.isLoading ? (
						<div className="flex items-center justify-center h-40">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-muted-foreground">Loading career paths...</span>
						</div>
					) : pathsQuery.error ? (
						<div className="bg-destructive/10 p-4 rounded-md text-destructive">
							<p>Error loading career paths: {pathsQuery.error.message}</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader className="bg-muted/50">
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Color</TableHead>
										<TableHead className="w-28">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pathsQuery.data?.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
												No career paths found. Create your first one!
											</TableCell>
										</TableRow>
									) : (
										pathsQuery.data?.map((path) => (
											<TableRow key={path.id}>
												<TableCell>
													<span
														className="font-medium hover:text-primary cursor-pointer"
														onClick={() => onSelectPath(path.id)}
													>
														{path.name}
													</span>
												</TableCell>
												<TableCell className="max-w-sm truncate">
													{path.description || "-"}
												</TableCell>
												<TableCell>
													<div
														className="w-6 h-6 rounded-full"
														style={{ backgroundColor: path.color || "#cccccc" }}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setEditingId(path.id)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => onSelectPath(path.id)}
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setConfirmDeleteId(path.id)}
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

				<CardFooter className="flex justify-between">
					<div className="text-xs text-muted-foreground">
						{pathsQuery.data ? `${pathsQuery.data.length} paths` : ''}
					</div>
				</CardFooter>
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
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmDeleteId(null)}
						>
							Cancel
						</Button>
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