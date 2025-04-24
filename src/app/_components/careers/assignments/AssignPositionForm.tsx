// src/app/hr/assignments/AssignPositionForm.tsx

"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";

interface AssignPositionFormProps {
	careerPathId: string;
	onComplete: () => void;
}

export function AssignPositionForm({
	careerPathId,
	onComplete
}: AssignPositionFormProps) {
	const { currentOrgId } = useSession();

	// Form state
	const [formData, setFormData] = useState({
		positionId: "",
		level: 1,
		sequenceInPath: 1,
		pathSpecificDescription: "",
	});

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch available positions to assign
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Fetch positions already in the path to avoid duplicates
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrgId!,
			careerPathId
		},
		{ enabled: !!currentOrgId && !!careerPathId }
	);

	// Set up mutation for assigning position
	const assignMutation = api.position.assignToPath.useMutation({
		onSuccess: () => {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
			toast.success("Position assigned successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to assign position: ${error.message}`);
		}
	});

	// Filter out positions already assigned to this path
	const availablePositions = positionsQuery.data?.filter(position => {
		// Check if this position is already in the path
		return !pathPositionsQuery.data?.some(
			detail => detail.positions?.id === position.id
		);
	}) || [];

	// Set first available position as default when data loads
	useEffect(() => {
		if (availablePositions.length > 0 && !formData.positionId) {
			setFormData(prev => ({
				...prev,
				positionId: availablePositions[0].id
			}));
		}
	}, [availablePositions, formData.positionId]);

	// Form handlers
	const handleChange = (
		name: string,
		value: string | number
	) => {
		setFormData(prev => ({ ...prev, [name]: value }));

		// If level changes and sequence is the same as previous level, update sequence too
		if (name === 'level' && prev.sequenceInPath === prev.level) {
			setFormData(prev => ({ ...prev, sequenceInPath: value as number }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.positionId) {
			toast.error("Please select a position");
			return;
		}

		assignMutation.mutate({
			organizationId: currentOrgId!,
			careerPathId,
			positionId: formData.positionId,
			level: formData.level,
			sequenceInPath: formData.sequenceInPath,
			pathSpecificDescription: formData.pathSpecificDescription || null
		});
	};

	// Loading state
	if (positionsQuery.isLoading || pathPositionsQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mr-2" />
				<span>Loading positions...</span>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 py-2">
			<div className="space-y-2">
				<Label htmlFor="positionId">Position</Label>
				{availablePositions.length === 0 ? (
					<div className="bg-muted/50 p-3 rounded-md text-muted-foreground text-sm">
						All available positions have already been assigned to this path.
					</div>
				) : (
					<Select
						value={formData.positionId}
						onValueChange={(value) => handleChange('positionId', value)}
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
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="level">Level</Label>
					<Input
						id="level"
						type="number"
						min={1}
						value={formData.level}
						onChange={(e) => handleChange('level', parseInt(e.target.value))}
						required
					/>
					<p className="text-xs text-muted-foreground">
						Seniority level in this path
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="sequenceInPath">Sequence</Label>
					<Input
						id="sequenceInPath"
						type="number"
						min={1}
						value={formData.sequenceInPath}
						onChange={(e) => handleChange('sequenceInPath', parseInt(e.target.value))}
						required
					/>
					<p className="text-xs text-muted-foreground">
						Order within the same level
					</p>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="pathSpecificDescription">
					Path-Specific Description (Optional)
				</Label>
				<Textarea
					id="pathSpecificDescription"
					value={formData.pathSpecificDescription}
					onChange={(e) => handleChange('pathSpecificDescription', e.target.value)}
					placeholder="Description specific to this position in this career path"
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-3 pt-4">
				<Button type="button" variant="outline" onClick={onComplete}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={assignMutation.isPending || availablePositions.length === 0}
				>
					{assignMutation.isPending ? (
						<>
							<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
							Assigning...
						</>
					) : (
						'Assign Position'
					)}
				</Button>
			</div>
		</form>
	);
}