// src/app/hr/jobs/InlinePositionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";

interface InlinePositionFormProps {
	mode: "create" | "edit";
	positionId?: string;
	onComplete: () => void;
	onCancel: () => void;
}

export function InlinePositionForm({
	mode,
	positionId,
	onComplete,
	onCancel
}: InlinePositionFormProps) {
	const { currentOrganization } = useOrganization();
	const [formData, setFormData] = useState({
		name: "",
		description: ""
	});

	// Get utils for cache invalidation
	const utils = api.useUtils();

	// If editing, fetch current position data
	const positionQuery = api.position.getById.useQuery(
		{ id: positionId! },
		{ enabled: mode === "edit" && !!positionId }
	);

	// Set up create/update mutations
	const createMutation = api.position.create.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrganization?.id! });
			toast.success("Position created successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to create position: ${error.message}`);
		}
	});

	const updateMutation = api.position.update.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrganization?.id! });
			toast.success("Position updated successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to update position: ${error.message}`);
		}
	});

	// Load existing data when editing
	useEffect(() => {
		if (mode === "edit" && positionQuery.data) {
			setFormData({
				name: positionQuery.data.name,
				description: positionQuery.data.base_description || ""
			});
		}
	}, [mode, positionQuery.data]);

	// Handle form changes
	const handleChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name) {
			toast.error("Position name is required");
			return;
		}

		if (mode === "create") {
			createMutation.mutate({
				organizationId: currentOrganization?.id!,
				name: formData.name,
				baseDescription: formData.description || null
			});
		} else {
			updateMutation.mutate({
				id: positionId!,
				name: formData.name,
				baseDescription: formData.description || null
			});
		}
	};

	// Loading state
	if (mode === "edit" && positionQuery.isLoading) {
		return (
			<Card className="bg-muted/20">
				<CardContent className="pt-6">
					<div className="animate-pulse space-y-3">
						<div className="h-5 bg-muted rounded w-1/3"></div>
						<div className="h-9 bg-muted rounded"></div>
						<div className="h-5 bg-muted rounded w-1/3"></div>
						<div className="h-24 bg-muted rounded"></div>
						<div className="flex justify-end space-x-2">
							<div className="h-9 bg-muted rounded w-24"></div>
							<div className="h-9 bg-muted rounded w-24"></div>
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
						<Label htmlFor="name">Position Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							placeholder="e.g., Senior Software Engineer"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleChange("description", e.target.value)}
							placeholder="General description of this position"
							rows={3}
						/>
					</div>

					<div className="flex justify-end space-x-2 pt-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending || updateMutation.isPending}
						>
							{createMutation.isPending || updateMutation.isPending ? (
								<span className="flex items-center">
									<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
									{mode === "create" ? "Creating..." : "Updating..."}
								</span>
							) : (
								mode === "create" ? "Create Position" : "Update Position"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}