// src/app/hr/components/CareerPathForm.tsx

"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CareerPathFormProps {
	pathId?: string;
	onComplete: () => void;
	mode: "create" | "edit";
}

/**
 * Career Path Form component
 * 
 * Provides a form for creating or editing career paths
 * Uses tRPC mutations to handle data operations
 */
export function CareerPathForm({
	pathId,
	onComplete,
	mode
}: CareerPathFormProps) {
	const { currentOrgId } = useSession();

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		color: "#4299E1", // Default blue color
	});

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// If editing, fetch the current path data
	const pathQuery = api.career.getPathById.useQuery(
		{ id: pathId! },
		{
			enabled: !!pathId,
			// Don't refetch too often since this data rarely changes
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Set up mutations based on mode
	const createMutation = api.career.createPath.useMutation({
		onSuccess: () => {
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
			onComplete();
		}
	});

	const updateMutation = api.career.updatePath.useMutation({
		onSuccess: () => {
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
			if (pathId) {
				utils.career.getPathById.invalidate({ id: pathId });
			}
			onComplete();
		}
	});

	// When editing, populate form with existing data
	useEffect(() => {
		if (mode === 'edit' && pathQuery.data) {
			setFormData({
				name: pathQuery.data.name,
				description: pathQuery.data.description || "",
				color: pathQuery.data.color || "#4299E1",
			});
		}
	}, [mode, pathQuery.data]);

	// Form handlers
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			alert("Name is required");
			return;
		}

		if (mode === "create") {
			createMutation.mutate({
				organizationId: currentOrgId!,
				name: formData.name,
				description: formData.description || null,
				color: formData.color
			});
		} else {
			updateMutation.mutate({
				id: pathId!,
				name: formData.name,
				description: formData.description || null,
				color: formData.color
			});
		}
	};

	// Show loading state when fetching path data for editing
	if (mode === "edit" && pathQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<span className="ml-2">Loading path data...</span>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 py-2">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					name="name"
					value={formData.name}
					onChange={handleChange}
					placeholder="e.g., Engineering"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					value={formData.description}
					onChange={handleChange}
					placeholder="Brief description of this career path"
					rows={3}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="color">Color</Label>
				<div className="flex items-center gap-3">
					<Input
						id="color"
						name="color"
						type="color"
						value={formData.color}
						onChange={handleChange}
						className="w-16 h-8"
					/>
					<span className="text-sm text-muted-foreground">
						Used for visual representation in the metro map
					</span>
				</div>
			</div>

			<div className="flex justify-end gap-3 pt-4">
				<Button type="button" variant="outline" onClick={onComplete}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending || updateMutation.isPending}
				>
					{(createMutation.isPending || updateMutation.isPending) ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{mode === "create" ? "Creating..." : "Saving..."}
						</>
					) : (
						mode === "create" ? "Create Path" : "Save Changes"
					)}
				</Button>
			</div>
		</form>
	);
}