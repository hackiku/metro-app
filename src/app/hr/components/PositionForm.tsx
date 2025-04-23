// src/app/hr/components/PositionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface PositionFormProps {
	positionId?: string;
	onComplete: () => void;
	mode: "create" | "edit";
}

/**
 * Position Form component
 * 
 * Provides a form for creating or editing generic positions
 * Uses tRPC mutations to handle data operations
 */
export function PositionForm({
	positionId,
	onComplete,
	mode
}: PositionFormProps) {
	const { currentOrgId } = useSession();

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		baseDescription: "",
	});

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// If editing, fetch the current position data
	const positionQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrgId! },
		{
			enabled: !!currentOrgId && mode === "edit" && !!positionId,
			// Don't refetch too often since this data rarely changes
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Set up mutations based on mode
	const createMutation = api.position.create.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
			onComplete();
		}
	});

	const updateMutation = api.position.update.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
			onComplete();
		}
	});

	// When editing, populate form with existing data
	useEffect(() => {
		if (mode === 'edit' && positionId && positionQuery.data) {
			const position = positionQuery.data.find(p => p.id === positionId);
			if (position) {
				setFormData({
					name: position.name,
					baseDescription: position.base_description || "",
				});
			}
		}
	}, [mode, positionId, positionQuery.data]);

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
				baseDescription: formData.baseDescription || null
			});
		} else {
			updateMutation.mutate({
				id: positionId!,
				name: formData.name,
				baseDescription: formData.baseDescription || null
			});
		}
	};

	// Show loading state when fetching position data for editing
	if (mode === "edit" && positionQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<span className="ml-2">Loading position data...</span>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 py-2">
			<div className="space-y-2">
				<Label htmlFor="name">Position Name</Label>
				<Input
					id="name"
					name="name"
					value={formData.name}
					onChange={handleChange}
					placeholder="e.g., Software Engineer"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="baseDescription">Description</Label>
				<Textarea
					id="baseDescription"
					name="baseDescription"
					value={formData.baseDescription}
					onChange={handleChange}
					placeholder="General description of this position"
					rows={3}
				/>
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
						mode === "create" ? "Create Position" : "Save Changes"
					)}
				</Button>
			</div>
		</form>
	);
}