// src/app/hr/career-paths/CareerPathForm.tsx
"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useSession } from "~/contexts/SessionContext";
import { useCareerPaths } from "../hooks/useCareerPaths";
import { Button } from "~/components/ui/button";
import { FormField } from "~/components/forms/FormField";
import { FormWrapper } from "~/components/forms/FormWrapper";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { toast } from "sonner";
import { api } from "~/trpc/react";

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

	// Color picker state
	const [colorPickerOpen, setColorPickerOpen] = useState(false);
	const [selectedColor, setSelectedColor] = useState("#4299E1");

	// When editing, populate form with existing data
	useEffect(() => {
		if (mode === 'edit' && pathId && pathQuery.data) {
			const pathColor = pathQuery.data.color || "#4299E1";
			setDefaultValues({
				name: pathQuery.data.name,
				description: pathQuery.data.description || "",
				color: pathColor,
			});
			setSelectedColor(pathColor);
		}
	}, [mode, pathId, pathQuery.data]);

	// Form submission handler
	const handleSubmit = (data: FormValues) => {
		// Update color with the currently selected one from the picker
		const formData = {
			...data,
			color: selectedColor
		};

		if (mode === "create") {
			createPath(
				{
					organizationId: currentOrgId!,
					name: formData.name,
					description: formData.description || null,
					color: formData.color
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
					name: formData.name,
					description: formData.description || null,
					color: formData.color
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

	// Color input change handler
	const handleColorChange = (color: string) => {
		setSelectedColor(color);
	};

	// Handle manual color input
	const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value.match(/^#[0-9A-F]{0,6}$/i)) {
			// Only update if it's valid hex format
			setSelectedColor(value.length === 7 ? value : value.padEnd(7, '0'));
		}
	};

	return (
		<FormWrapper
			schema={careerPathSchema}
			defaultValues={{
				...defaultValues,
				color: selectedColor // Ensure the color is kept in sync
			}}
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
					<Label htmlFor="color">Color</Label>
					<div className="flex items-center gap-2">
						<Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="h-10 w-10 p-0 border-2"
									style={{
										backgroundColor: selectedColor,
										borderColor: selectedColor
									}}
								/>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-3" side="right" align="start">
								<HexColorPicker
									color={selectedColor}
									onChange={handleColorChange}
									style={{ width: '200px', height: '200px' }}
								/>
							</PopoverContent>
						</Popover>

						<Input
							value={selectedColor}
							onChange={handleColorInputChange}
							className="font-mono h-10 w-24"
							maxLength={7}
						/>

						<p className="text-sm text-muted-foreground">
							Used in metro map
						</p>
					</div>
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