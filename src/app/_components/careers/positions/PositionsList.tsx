// src/app/hr/positions/PositionsList.tsx

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { ExpandableTable } from "~/components/tables/ExpandableTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { toast } from "sonner";
import { PositionForm } from "./PositionForm";

export function PositionsList() {
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
			toast.success("Position deleted successfully");
		},
		onError: (error) => {
			toast.error(`Failed to delete: ${error.message}`);
		}
	});

	// Handler for deleting a position
	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
	};

	// Table columns configuration
	const columns = [
		{ key: "name", header: "Name" },
		{ key: "base_description", header: "Description" }
	];

	// Render expanded content for each row
	const renderExpanded = (position: any) => (
		<div className="p-4 space-y-4">
			<div className="flex gap-2">
				<Button variant="outline" onClick={() => setEditingId(position.id)}>
					<Pencil className="mr-2 h-4 w-4" /> Edit Position
				</Button>
				<Button
					variant="outline"
					className="text-destructive"
					onClick={() => setConfirmDeleteId(position.id)}
				>
					<Trash2 className="mr-2 h-4 w-4" /> Delete
				</Button>
			</div>

			<div>
				<h3 className="text-sm font-medium">Description</h3>
				<p className="text-sm text-muted-foreground mt-1">{position.base_description || "No description provided."}</p>
			</div>
		</div>
	);

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
						<div className="h-40 flex items-center justify-center">
							<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
						</div>
					) : positionsQuery.error ? (
						<div className="p-4 text-destructive bg-destructive/10 rounded-md">
							Error loading positions: {positionsQuery.error.message}
						</div>
					) : (
						<ExpandableTable
							data={positionsQuery.data || []}
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
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? (
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