// src/app/hr/career-paths/CareerPathForm.tsx
"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useSession } from "~/contexts/SessionContext";
import { useCareerPaths } from "../hooks/useCareerPaths";
import { Button } from "~/components/ui/button";
import { FormField } from "~/components/forms/FormField";
import { FormWrapper } from "~/components/forms/FormWrapper";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import Link from "next/link";

interface CareerPathFormProps {
	pathId?: string;
	onComplete: () => void;
	mode: "create" | "edit";
}

// Form validation schema
const careerPathSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional().nullable(),
	color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").default("#4299E1"),
});

type FormValues = z.infer<typeof careerPathSchema>;

export function CareerPathForm({
	pathId,
	onComplete,
	mode
}: CareerPathFormProps) {
	const { currentOrgId } = useSession();
	const {
		careerPaths,
		isLoading,
		createPath,
		updatePath,
		isCreating,
		isUpdating
	} = useCareerPaths();

	// For edit mode, fetch the specific path data
	const pathQuery = api.career.getPathById.useQuery(
		{ id: pathId! },
		{
			enabled: mode === 'edit' && !!pathId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	const [defaultValues, setDefaultValues] = useState<FormValues>({
		name: "",
		description: "",
		color: "#4299E1",
	});

	// When editing, populate form with existing data
	useEffect(() => {
		if (mode === 'edit' && pathId && pathQuery.data) {
			setDefaultValues({
				name: pathQuery.data.name,
				description: pathQuery.data.description || "",
				color: pathQuery.data.color || "#4299E1",
			});
		}
	}, [mode, pathId, pathQuery.data]);

	// Form submission handler
	const handleSubmit = (data: FormValues) => {
		if (mode === "create") {
			createPath(
				{
					organizationId: currentOrgId!,
					name: data.name,
					description: data.description || null,
					color: data.color
				},
				{
					onSuccess: () => {
						toast.success("Career path created successfully");
						onComplete();
					},
					onError: (error) => {
						toast.error(`Failed to create: ${error.message}`);
					}
				}
			);
		} else {
			updatePath(
				{
					id: pathId!,
					name: data.name,
					description: data.description || null,
					color: data.color
				},
				{
					onSuccess: () => {
						toast.success("Career path updated successfully");
						onComplete();
					},
					onError: (error) => {
						toast.error(`Failed to update: ${error.message}`);
					}
				}
			);
		}
	};

	if (mode === "edit" && pathQuery.isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
			</div>
		);
	}

	return (
		<FormWrapper
			schema={careerPathSchema}
			defaultValues={defaultValues}
			onSubmit={handleSubmit}
		>
			<div className="space-y-4">
				<FormField
					name="name"
					label="Name"
					placeholder="e.g., Engineering"
				/>

				<FormField
					name="description"
					label="Description"
					placeholder="Brief description of this career path"
					type="textarea"
				/>

				<div className="space-y-2">
					<FormField
						name="color"
						label="Color"
						type="color"
					/>
					<p className="text-sm text-muted-foreground">
						Used for visual representation in the metro map
					</p>
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<Button type="button" variant="outline" onClick={onComplete}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isCreating || isUpdating}
					>
						{(isCreating || isUpdating) ? (
							<>
								<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-background rounded-full" />
								{mode === "create" ? "Creating..." : "Saving..."}
							</>
						) : (
							mode === "create" ? "Create Path" : "Save Changes"
						)}
					</Button>
				</div>
			</div>
		</FormWrapper>
	);
}