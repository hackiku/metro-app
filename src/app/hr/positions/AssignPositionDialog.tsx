// src/app/hr/positions/AssignPositionDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "~/components/ui/select";
import { toast } from "sonner";

interface AssignPositionDialogProps {
	open: boolean;
	careerPathId: string;
	onOpenChange: (open: boolean) => void;
	onComplete: () => void;
}

export function AssignPositionDialog({
	open,
	careerPathId,
	onOpenChange,
	onComplete
}: AssignPositionDialogProps) {
	const { currentOrganization } = useOrganization();
	const [positionId, setPositionId] = useState<string>("");
	const [level, setLevel] = useState(1);

	// Get TRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch available positions
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	// Fetch positions already in the path
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrganization?.id!,
			careerPathId
		},
		{ enabled: !!currentOrganization?.id && !!careerPathId }
	);

	// Filter out positions already assigned to this path
	const availablePositions = positionsQuery.data?.filter(position => {
		return !pathPositionsQuery.data?.some(
			detail => detail.positions?.id === position.id
		);
	}) || [];

	// Set up mutation for assigning position
	const assignMutation = api.position.assignToPath.useMutation({
		onSuccess: () => {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrganization?.id!,
				careerPathId
			});
			toast.success("Position assigned successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to assign position: ${error.message}`);
		}
	});

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!positionId) {
			toast.error("Please select a position");
			return;
		}

		assignMutation.mutate({
			organizationId: currentOrganization?.id!,
			careerPathId,
			positionId,
			level,
			sequenceInPath: level,
			pathSpecificDescription: null
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Assign Position to Path</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="positionId">Position</Label>
						<Select
							value={positionId}
							onValueChange={setPositionId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a position" />
							</SelectTrigger>
							<SelectContent>
								{availablePositions.map((position) => (
									<SelectItem key={position.id} value={position.id}>
										{position.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="level">Level</Label>
						<Input
							id="level"
							type="number"
							min={1}
							value={level}
							onChange={(e) => setLevel(parseInt(e.target.value))}
							required
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={assignMutation.isPending || availablePositions.length === 0}
						>
							{assignMutation.isPending ? "Assigning..." : "Assign Position"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}