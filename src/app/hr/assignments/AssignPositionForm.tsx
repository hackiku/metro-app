// src/app/hr/assignments/AssignPositionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AssignPositionFormProps {
	careerPathId: string;
	positionDetailId?: string;
	onComplete: () => void;
}

export function AssignPositionForm({
	careerPathId,
	positionDetailId,
	onComplete
}: AssignPositionFormProps) {
	const { currentOrganization } = useOrganization();
	const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

	// Form state for existing position
	const [existingFormData, setExistingFormData] = useState({
		positionId: "",
		level: 1,
		sequenceInPath: 1,
		pathSpecificDescription: "",
	});

	// Form state for new position
	const [newPositionFormData, setNewPositionFormData] = useState({
		name: "",
		baseDescription: "",
		level: 1,
		sequenceInPath: 1,
		pathSpecificDescription: "",
	});

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch available positions to assign
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	// Fetch positions already in the path to avoid duplicates
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrganization?.id!,
			careerPathId
		},
		{ enabled: !!currentOrganization?.id && !!careerPathId }
	);

	// Fetch existing position detail if editing
	const positionDetailQuery = api.position.getPositionDetailById.useQuery(
		{ id: positionDetailId! },
		{ enabled: !!positionDetailId }
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

	// Set up mutation for updating position detail
	const updateDetailMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrganization?.id!,
				careerPathId
			});
			toast.success("Position details updated successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to update position: ${error.message}`);
		}
	});

	// Set up mutation for creating a new position
	const createPositionMutation = api.position.create.useMutation({
		onSuccess: (data) => {
			// After creating the position, assign it to the path
			assignMutation.mutate({
				organizationId: currentOrganization?.id!,
				careerPathId,
				positionId: data.id,
				level: newPositionFormData.level,
				sequenceInPath: newPositionFormData.sequenceInPath,
				pathSpecificDescription: newPositionFormData.pathSpecificDescription || null
			});

			// Invalidate positions query
			utils.position.getAll.invalidate({ organizationId: currentOrganization?.id! });
			toast.success("New position created and assigned");
		},
		onError: (error) => {
			toast.error(`Failed to create position: ${error.message}`);
		}
	});

	// Filter out positions already assigned to this path
	const availablePositions = positionsQuery.data?.filter(position => {
		// When editing, include the current position
		if (positionDetailId && positionDetailQuery.data?.position_id === position.id) {
			return true;
		}
		// Check if this position is already in the path
		return !pathPositionsQuery.data?.some(
			detail => detail.positions?.id === position.id
		);
	}) || [];

	// Set first available position as default when data loads
	useEffect(() => {
		if (availablePositions.length > 0 && !existingFormData.positionId) {
			setExistingFormData(prev => ({
				...prev,
				positionId: availablePositions[0].id
			}));
		}
	}, [availablePositions, existingFormData.positionId]);

	// Load existing position detail data when editing
	useEffect(() => {
		if (positionDetailId && positionDetailQuery.data) {
			const detail = positionDetailQuery.data;
			setExistingFormData({
				positionId: detail.position_id,
				level: detail.level,
				sequenceInPath: detail.sequence_in_path || detail.level,
				pathSpecificDescription: detail.path_specific_description || "",
			});
			setActiveTab("existing");
		}
	}, [positionDetailId, positionDetailQuery.data]);

	// Form handlers for existing position
	const handleExistingChange = (
		name: string,
		value: string | number
	) => {
		setExistingFormData(prev => ({ ...prev, [name]: value }));

		// If level changes and sequence is the same as previous level, update sequence too
		if (name === 'level' && prev.sequenceInPath === prev.level) {
			setExistingFormData(prev => ({ ...prev, sequenceInPath: value as number }));
		}
	};

	// Form handlers for new position
	const handleNewPositionChange = (
		name: string,
		value: string | number
	) => {
		setNewPositionFormData(prev => ({ ...prev, [name]: value }));

		// If level changes and sequence is the same as previous level, update sequence too
		if (name === 'level' && prev.sequenceInPath === prev.level) {
			setNewPositionFormData(prev => ({ ...prev, sequenceInPath: value as number }));
		}
	};

	// Handle form submission for existing position
	const handleExistingSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!existingFormData.positionId) {
			toast.error("Please select a position");
			return;
		}

		if (positionDetailId) {
			// Update existing position detail
			updateDetailMutation.mutate({
				id: positionDetailId,
				level: existingFormData.level,
				sequenceInPath: existingFormData.sequenceInPath,
				pathSpecificDescription: existingFormData.pathSpecificDescription || null
			});
		} else {
			// Assign new position to path
			assignMutation.mutate({
				organizationId: currentOrganization?.id!,
				careerPathId,
				positionId: existingFormData.positionId,
				level: existingFormData.level,
				sequenceInPath: existingFormData.sequenceInPath,
				pathSpecificDescription: existingFormData.pathSpecificDescription || null
			});
		}
	};

	// Handle form submission for new position
	const handleNewPositionSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!newPositionFormData.name) {
			toast.error("Position name is required");
			return;
		}

		createPositionMutation.mutate({
			organizationId: currentOrganization?.id!,
			name: newPositionFormData.name,
			baseDescription: newPositionFormData.baseDescription || null
		});
	};

	// Loading state
	if ((positionDetailId && positionDetailQuery.isLoading) ||
		positionsQuery.isLoading ||
		pathPositionsQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mr-2" />
				<span>Loading positions...</span>
			</div>
		);
	}

	return (
		<div className="space-y-4 py-2">
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")} className="w-full">
				<TabsList className="w-full grid grid-cols-2">
					<TabsTrigger value="existing">Existing Position</TabsTrigger>
					<TabsTrigger value="new">Create New Position</TabsTrigger>
				</TabsList>

				<TabsContent value="existing">
					<form onSubmit={handleExistingSubmit} className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="positionId">Position</Label>
							{availablePositions.length === 0 ? (
								<div className="bg-muted/50 p-3 rounded-md text-muted-foreground text-sm">
									All available positions have already been assigned to this path.
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="mt-2 w-full"
										onClick={() => setActiveTab("new")}
									>
										<Plus className="mr-2 h-4 w-4" />
										Create a new position instead
									</Button>
								</div>
							) : (
								<Select
									value={existingFormData.positionId}
									onValueChange={(value) => handleExistingChange('positionId', value)}
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
									value={existingFormData.level}
									onChange={(e) => handleExistingChange('level', parseInt(e.target.value))}
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
									value={existingFormData.sequenceInPath}
									onChange={(e) => handleExistingChange('sequenceInPath', parseInt(e.target.value))}
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
								value={existingFormData.pathSpecificDescription}
								onChange={(e) => handleExistingChange('pathSpecificDescription', e.target.value)}
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
								disabled={assignMutation.isPending || updateDetailMutation.isPending || availablePositions.length === 0}
							>
								{assignMutation.isPending || updateDetailMutation.isPending ? (
									<>
										<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
										{positionDetailId ? "Updating..." : "Assigning..."}
									</>
								) : (
									positionDetailId ? 'Update Position' : 'Assign Position'
								)}
							</Button>
						</div>
					</form>
				</TabsContent>

				<TabsContent value="new">
					<form onSubmit={handleNewPositionSubmit} className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="name">Position Name</Label>
							<Input
								id="name"
								value={newPositionFormData.name}
								onChange={(e) => handleNewPositionChange('name', e.target.value)}
								placeholder="e.g., Senior Software Engineer"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="baseDescription">
								Generic Description (Optional)
							</Label>
							<Textarea
								id="baseDescription"
								value={newPositionFormData.baseDescription}
								onChange={(e) => handleNewPositionChange('baseDescription', e.target.value)}
								placeholder="Description of this position that applies across all career paths"
								rows={2}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="newLevel">Level</Label>
								<Input
									id="newLevel"
									type="number"
									min={1}
									value={newPositionFormData.level}
									onChange={(e) => handleNewPositionChange('level', parseInt(e.target.value))}
									required
								/>
								<p className="text-xs text-muted-foreground">
									Seniority level in this path
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="newSequenceInPath">Sequence</Label>
								<Input
									id="newSequenceInPath"
									type="number"
									min={1}
									value={newPositionFormData.sequenceInPath}
									onChange={(e) => handleNewPositionChange('sequenceInPath', parseInt(e.target.value))}
									required
								/>
								<p className="text-xs text-muted-foreground">
									Order within the same level
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="newPathSpecificDescription">
								Path-Specific Description (Optional)
							</Label>
							<Textarea
								id="newPathSpecificDescription"
								value={newPositionFormData.pathSpecificDescription}
								onChange={(e) => handleNewPositionChange('pathSpecificDescription', e.target.value)}
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
								disabled={createPositionMutation.isPending || assignMutation.isPending}
							>
								{createPositionMutation.isPending || assignMutation.isPending ? (
									<>
										<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
										{createPositionMutation.isPending ? "Creating..." : "Assigning..."}
									</>
								) : (
									'Create & Assign'
								)}
							</Button>
						</div>
					</form>
				</TabsContent>
			</Tabs>
		</div>
	);
}