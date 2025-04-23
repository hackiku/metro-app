// src/app/hr/components/AssignPositionForm.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Loader2 } from "lucide-react";

interface AssignPositionFormProps {
	careerPathId: string;
	onComplete: () => void;
}

/**
 * Assign Position Form component
 * 
 * Form for assigning a position to a career path with specific level and sequence
 * Uses tRPC mutations to handle data operations
 */
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
			onComplete();
		}
	});

	// Filter out positions already assigned to this path
	const availablePositions = positionsQuery.data?.filter(position => {
		// Check if this position is already in the path
		return !pathPositionsQuery.data?.some(
			detail => detail.positions?.id === position.id
		);
	}) || [];

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
			alert("Please select a position");
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
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<span className="ml-2">Loading positions...</span>
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
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
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