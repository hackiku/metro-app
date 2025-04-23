// src/app/hr/components/PositionTable.tsx
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
import { Pencil, Plus, Loader2, Trash2 } from "lucide-react";
import { PositionForm } from "./PositionForm";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

/**
 * Position Table component
 * 
 * Displays a table of generic positions and allows:
 * - Creating new positions
 * - Editing existing positions
 * - Deleting positions
 */
export function PositionTable() {
	const { currentOrgId } = useSession();
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch positions with tRPC query
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Set up delete mutation
	const deleteMutation = api.position.delete.useMutation({
		onSuccess: () => {
			setConfirmDeleteId(null);
			// Invalidate the positions query to refresh the data
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
		},
	});

	// Handler for deleting a position
	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
	};

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">Positions</CardTitle>
							<CardDescription>
								Create and manage generic position titles
							</CardDescription>
						</div>
						<Button
							onClick={() => setIsCreating(true)}
							disabled={positionsQuery.isLoading}
						>
							<Plus className="mr-2 h-4 w-4" />
							New Position
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					{positionsQuery.isLoading ? (
						<div className="flex items-center justify-center h-40">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-muted-foreground">Loading positions...</span>
						</div>
					) : positionsQuery.error ? (
						<div className="bg-destructive/10 p-4 rounded-md text-destructive">
							<p>Error loading positions: {positionsQuery.error.message}</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader className="bg-muted/50">
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="w-24">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{positionsQuery.data?.length === 0 ? (
										<TableRow>
											<TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
												No positions found. Create your first one!
											</TableCell>
										</TableRow>
									) : (
										positionsQuery.data?.map((position) => (
											<TableRow key={position.id}>
												<TableCell>
													<span className="font-medium">
														{position.name}
													</span>
												</TableCell>
												<TableCell className="max-w-sm truncate">
													{position.base_description || "-"}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setEditingId(position.id)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setConfirmDeleteId(position.id)}
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
						{positionsQuery.data ? `${positionsQuery.data.length} positions` : ''}
					</div>
				</CardFooter>
			</Card>

			{/* Create/Edit Forms in Dialogs */}
			<Dialog open={isCreating} onOpenChange={setIsCreating}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create Position</DialogTitle>
						<DialogDescription>
							Add a new generic position title
						</DialogDescription>
					</DialogHeader>

					<PositionForm
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
						<DialogTitle>Edit Position</DialogTitle>
						<DialogDescription>
							Update position details
						</DialogDescription>
					</DialogHeader>

					{editingId && (
						<PositionForm
							positionId={editingId}
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
							Are you sure you want to delete this position? This action cannot be undone.
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