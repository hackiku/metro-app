// src/app/hr/jobs/InlineAssignForm.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "~/components/ui/select";
import { toast } from "sonner";

interface InlineAssignFormProps {
	careerPathId: string;
	onComplete: () => void;
	onCancel: () => void;
}

export function InlineAssignForm({
	careerPathId,
	onComplete,
	onCancel
}: InlineAssignFormProps) {
	const { currentOrganization } = useOrganization();
	const [formData, setFormData] = useState({
		positionId: "",
		level: 1
	});

	// Get utils for cache invalidation
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

	// Filter out positions already assigned to this path
	const availablePositions = positionsQuery.data?.filter(position => {
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

	// Handle form changes
	const handleChange = (field: string, value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.positionId) {
			toast.error("Please select a position");
			return;
		}

		assignMutation.mutate({
			organizationId: currentOrganization?.id!,
			careerPathId,
			positionId: formData.positionId,
			level: formData.level,
			sequenceInPath: formData.level,
			pathSpecificDescription: null
		});
	};

	// Loading state
	if (positionsQuery.isLoading || pathPositionsQuery.isLoading) {
		return (
			<Card className="bg-muted/20">
				<CardContent className="pt-6">
					<div className="animate-pulse space-y-3">
						<div className="h-5 bg-muted rounded w-1/3"></div>
						<div className="h-9 bg-muted rounded"></div>
						<div className="h-5 bg-muted rounded w-1/3"></div>
						<div className="h-9 bg-muted rounded"></div>
						<div className="flex justify-end space-x-2">
							<div className="h-9 bg-muted rounded w-24"></div>
							<div className="h-9 bg-muted rounded w-24"></div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show empty state if no positions available
	if (availablePositions.length === 0) {
		return (
			<Card className="bg-muted/20">
				<CardContent className="pt-6">
					<div className="text-center py-6">
						<h3 className="font-medium text-lg mb-2">No Available Positions</h3>
						<p className="text-muted-foreground mb-4">
							All positions have already been assigned to this career path.
						</p>
						<div className="flex justify-center space-x-2">
							<Button variant="outline" onClick={onCancel}>
								Cancel
							</Button>
							<Button
								variant="default"
								onClick={() => {
									// Here you could open a different form to create a new position
									onCancel();
								}}
							>
								Create New Position
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-muted/20">
			<CardContent className="pt-6">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="positionId">Position</Label>
						<Select
							value={formData.positionId}
							onValueChange={(value) => handleChange("positionId", value)}
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
							value={formData.level}
							onChange={(e) => handleChange("level", parseInt(e.target.value))}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Seniority level in this path (positions at the same level appear together)
						</p>
					</div>

					<div className="flex justify-end space-x-2 pt-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={assignMutation.isPending}
						>
							{assignMutation.isPending ? (
								<span className="flex items-center">
									<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
									Assigning...
								</span>
							) : (
								"Assign Position"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}