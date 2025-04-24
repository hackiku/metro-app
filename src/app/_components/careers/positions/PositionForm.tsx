// src/app/hr/positions/PositionForm.tsx

"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { FormWrapper } from "~/components/forms/FormWrapper";
import { FormField } from "~/components/forms/FormField";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

interface PositionFormProps {
	positionId?: string;
	onComplete: () => void;
	mode: "create" | "edit";
}

// Form validation schema
const positionSchema = z.object({
	name: z.string().min(1, "Name is required"),
	baseDescription: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof positionSchema>;

export function PositionForm({
	positionId,
	onComplete,
	mode
}: PositionFormProps) {
	const { currentOrgId } = useSession();
	const utils = api.useUtils();

	const [defaultValues, setDefaultValues] = useState<FormValues>({
		name: "",
		baseDescription: "",
	});

	// If editing, fetch the current position data
	const positionsQuery = api.position.getAll.useQuery(
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
			toast.success("Position created successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to create: ${error.message}`);
		}
	});

	const updateMutation = api.position.update.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
			toast.success("Position updated successfully");
			onComplete();
		},
		onError: (error) => {
			toast.error(`Failed to update: ${error.message}`);
		}
	});

	// When editing, populate form with existing data
	useEffect(() => {
		if (mode === 'edit' && positionId && positionsQuery.data) {
			const position = positionsQuery.data.find(p => p.id === positionId);
			if (position) {
				setDefaultValues({
					name: position.name,
					baseDescription: position.base_description || "",
				});
			}
		}
	}, [mode, positionId, positionsQuery.data]);

	// Form submission handler
	const handleSubmit = (data: FormValues) => {
		if (mode === "create") {
			createMutation.mutate({
				organizationId: currentOrgId!,
				name: data.name,
				baseDescription: data.baseDescription || null
			});
		} else {
			updateMutation.mutate({
				id: positionId!,
				name: data.name,
				baseDescription: data.baseDescription || null
			});
		}
	};

	// Show loading state when fetching position data for editing
	if (mode === "edit" && positionsQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
			</div>
		);
	}

	return (
		<FormWrapper
			schema={positionSchema}
			defaultValues={defaultValues}
			onSubmit={handleSubmit}
		>
			<FormField
				name="name"
				label="Position Name"
				placeholder="e.g., Software Engineer"
			/>

			<FormField
				name="baseDescription"
				label="Description"
				placeholder="General description of this position"
				type="textarea"
			/>

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
							<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
							{mode === "create" ? "Creating..." : "Saving..."}
						</>
					) : (
						mode === "create" ? "Create Position" : "Save Changes"
					)}
				</Button>
			</div>
		</FormWrapper>
	);
}