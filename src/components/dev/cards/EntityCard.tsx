// src/components/dev/cards/EntityCard.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Save, RotateCcw, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
// REMOVE THIS IMPORT if you are using tRPC hooks directly in EntityCard
// import { entityHandlers } from "../utils/entityHandler";
import { entityFieldCategories } from "../utils/entityHandler"; // Keep this for field categories
import { CopyJsonButton } from "../buttons/CopyJsonButton";

interface EntityCardProps {
	entity: 'user' | 'organization' | 'position' | 'competence' | 'career_path';
	data: Record<string, any>;
	title?: string;
	category?: string;
}

export function EntityCard({ entity, data, title, category = 'primary' }: EntityCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	// const [isSaving, setIsSaving] = useState(false); // isSaving will come from the mutation hook
	const [editedData, setEditedData] = useState<Record<string, any>>({ ...data });
	const utils = api.useUtils();

	// Initialize ALL possible mutations your card might use.
	// This can be a bit much if the card is very generic. Consider breaking down EntityCard if so.
	const updateUserMutation = api.user.update.useMutation({
		onSuccess: () => {
			utils.user.getAll.invalidate();
			if (editedData.id) utils.user.getById.invalidate({ id: editedData.id });
			setHasChanges(false);
			toast.success(`${title || 'User'} updated successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to save User: ${error.message}`);
		}
	});

	const updateOrganizationMutation = api.organization.update.useMutation({
		onSuccess: () => {
			utils.organization.getAll.invalidate();
			if (editedData.id) utils.organization.getById.invalidate({ id: editedData.id });
			setHasChanges(false);
			toast.success(`${title || 'Organization'} updated successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to save Organization: ${error.message}`);
		}
	});

	const updatePositionDetailMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			if (editedData.id) utils.position.getPositionDetailById.invalidate({ id: editedData.id });
			// Add any other relevant invalidations, e.g., getAllDetails
			utils.position.getAllDetails.invalidate({ organizationId: data.organization_id }); // Assuming organization_id is on data
			setHasChanges(false);
			toast.success(`${title || 'Position Detail'} updated successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to save Position Detail: ${error.message}`);
		}
	});

	const updateUserCompetenceMutation = api.user.updateUserCompetence.useMutation({
		onSuccess: () => {
			if (editedData.user_id) utils.user.getUserCompetences.invalidate({ userId: editedData.user_id });
			setHasChanges(false);
			toast.success(`${title || 'Competence'} updated successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to save Competence: ${error.message}`);
		}
	});

	const updateCareerPlanMutation = api.careerPlan.updatePlan.useMutation({
		onSuccess: () => {
			if (editedData.id) utils.careerPlan.getPlanById.invalidate({ id: editedData.id });
			// Invalidate getUserPlans if necessary (might need userId, orgId from data)
			if (data.user_id && data.organization_id) {
				utils.careerPlan.getUserPlans.invalidate({ userId: data.user_id, organizationId: data.organization_id });
			}
			setHasChanges(false);
			toast.success(`${title || 'Career Plan'} updated successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to save Career Plan: ${error.message}`);
		}
	});


	// Get fields for this category and entity
	const getFields = () => { /* ... no change ... */
		const categoryFields = entityFieldCategories[entity]?.[category] || [];
		return categoryFields.filter(field => {
			if (field.includes('.')) {
				const [parent, child] = field.split('.');
				return data[parent] && data[parent][child] !== undefined;
			}
			return field in data;
		});
	};

	useEffect(() => { /* ... no change ... */
		setEditedData({ ...data });
		setHasChanges(false);
	}, [data]);

	const handleFieldChange = (field: string, value: any) => { /* ... no change ... */
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setEditedData(prev => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value
				}
			}));
		} else {
			setEditedData(prev => ({
				...prev,
				[field]: value
			}));
		}
		setHasChanges(true);
	};
	const formatFieldName = (field: string) => { /* ... no change ... */
		const parts = field.split('.');
		const fieldName = parts[parts.length - 1];
		return fieldName
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};
	const getFieldValue = (field: string) => { /* ... no change ... */
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			return editedData[parent]?.[child];
		}
		return editedData[field];
	};


	const handleSave = async () => {
		if (!hasChanges) return;
		// setIsSaving will be handled by the mutation hook's isLoading state

		try {
			if (entity === 'user') {
				updateUserMutation.mutate({
					id: editedData.id,
					full_name: editedData.full_name,
					email: editedData.email,
					level: editedData.level, // Ensure this is a valid enum value
					years_in_role: parseFloat(editedData.years_in_role), // Ensure it's a number
					current_position_details_id: editedData.current_position_details_id
				});
			} else if (entity === 'organization') {
				updateOrganizationMutation.mutate({
					id: editedData.id,
					name: editedData.name,
					description: editedData.description,
					logo_url: editedData.logo_url,
					primary_color: editedData.primary_color,
					secondary_color: editedData.secondary_color
				});
			} else if (entity === 'position') {
				// Ensure all fields expected by updatePositionDetail are present and correctly typed
				updatePositionDetailMutation.mutate({
					id: editedData.id,
					level: parseInt(editedData.level, 10), // Ensure it's a number
					sequenceInPath: editedData.sequence_in_path ? parseInt(editedData.sequence_in_path, 10) : undefined,
					pathSpecificDescription: editedData.path_specific_description,
					workFocus: editedData.work_focus, // Add these if they are in your form
					teamInteraction: editedData.team_interaction,
					workStyle: editedData.work_style
				});
			} else if (entity === 'competence') {
				// This represents a UserCompetence record
				updateUserCompetenceMutation.mutate({
					// user_id might be directly on editedData OR on the original data if not editable
					userId: editedData.user_id || data.user_id,
					competenceId: editedData.competence?.id, // Assuming competence object is nested
					currentLevel: parseInt(editedData.current_level, 10),
					targetLevel: editedData.target_level ? parseInt(editedData.target_level, 10) : null
				});
			} else if (entity === 'career_path') { // This represents a UserCareerPlan record
				updateCareerPlanMutation.mutate({
					id: editedData.id,
					status: editedData.status, // Ensure this is a valid enum value
					estimatedTotalDuration: editedData.estimated_total_duration,
					notes: editedData.notes
				});
			} else {
				// This fallback to entityHandlers can be removed if all cases are covered above
				// console.warn(`No specific tRPC mutation hook for entity type: ${entity}`);
				throw new Error(`No save handler for entity type: ${entity}`);
			}
			// Success/error handling is now part of the mutation hooks' onSuccess/onError
		} catch (error) { // This catch might not be strictly necessary if hooks handle errors
			console.error("Error initiating save:", error);
			toast.error(`Failed to initiate save: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const handleReset = () => { /* ... no change ... */
		setEditedData({ ...data });
		setHasChanges(false);
	};
	const renderField = (field: string) => { /* ... no change, but ensure input types match Zod schema (e.g. number for years_in_role) ... */
		const value = getFieldValue(field);

		if (isEditing) {
			if (field === 'id' || field.endsWith('_id') || field === 'created_at' || field === 'updated_at') {
				return (
					<div className="p-2 bg-muted/50 rounded-md text-sm break-all text-muted-foreground">
						{value === null || value === undefined ? 'null' : String(value)}
					</div>
				);
			}
			if (typeof value === 'boolean') { /* ... */ }
			// Ensure specific fields get 'number' type input
			if (field === 'years_in_role' || field === 'level' || field === 'sequence_in_path' || field === 'current_level' || field === 'target_level') {
				return (
					<input
						type="number"
						value={value || ''} // Handle null/undefined for number inputs
						onChange={(e) => handleFieldChange(field, e.target.value === '' ? null : Number(e.target.value))}
						className="p-2 bg-muted/30 rounded-md text-sm w-full"
					/>
				);
			}
			return ( // Default text field
				<input
					value={value !== null && value !== undefined ? String(value) : ''}
					onChange={(e) => handleFieldChange(field, e.target.value)}
					className="p-2 bg-muted/30 rounded-md text-sm w-full"
				/>
			);
		}
		return ( /* ... non-editing display ... */
			<div className="p-2 bg-muted/30 rounded-md text-sm break-all">
				{value === null || value === undefined ? (
					<span className="text-muted-foreground italic">null</span>
				) : typeof value === 'object' ? (
					JSON.stringify(value)
				) : (
					String(value)
				)}
			</div>
		);
	};
	const getCategoryColor = () => { /* ... no change ... */
		switch (category) {
			case "primary": return "bg-primary/5";
			case "details": return "bg-blue-500/5";
			case "relations": return "bg-amber-500/5";
			case "metadata": return "bg-slate-500/5";
			default: return "bg-gray-500/5";
		}
	};

	const fields = getFields();
	const cardTitle = title || `${entity} ${category.charAt(0).toUpperCase() + category.slice(1)}`;

	// Determine if the current entity type is saving based on its mutation hook
	const isSaving =
		(entity === 'user' && updateUserMutation.isLoading) ||
		(entity === 'organization' && updateOrganizationMutation.isLoading) ||
		(entity === 'position' && updatePositionDetailMutation.isLoading) ||
		(entity === 'competence' && updateUserCompetenceMutation.isLoading) ||
		(entity === 'career_path' && updateCareerPlanMutation.isLoading);

	return (
		<Card className="overflow-hidden transition-all hover:shadow-md">
			{/* ... CardHeader (no change) ... */}
			<CardHeader className={`flex flex-row items-center justify-between p-3 ${getCategoryColor()}`}>
				<CardTitle className="text-md font-medium">{cardTitle}</CardTitle>
				<div className="flex items-center gap-1">
					<CopyJsonButton
						jsonData={Object.fromEntries(
							fields.map(field => [field, getFieldValue(field)])
						)}
						tooltipText={`Copy ${cardTitle} as JSON`}
					/>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setIsEditing(!isEditing)}
					>
						{isEditing ? (
							<Eye className="h-4 w-4" />
						) : (
							<Edit className="h-4 w-4" />
						)}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-3"> {/* ... no change in structure ... */}
				<div className="space-y-2">
					{fields.map(field => (
						<div key={field} className="space-y-1">
							<div className="text-xs font-medium text-muted-foreground flex justify-between">
								<span>{formatFieldName(field)}</span>
								{field === 'id' || field.endsWith('_id') || field === 'created_at' || field === 'updated_at' ? (
									<Badge variant="outline" className="text-[10px]">read-only</Badge>
								) : null}
							</div>
							{renderField(field)}
						</div>
					))}
					{fields.length === 0 && (
						<div className="text-sm text-muted-foreground italic">No fields to display</div>
					)}
				</div>
			</CardContent>
			{hasChanges && ( // Footer for save/reset
				<CardFooter className="flex justify-end gap-2 py-2 px-3 bg-muted/30">
					<Button
						variant="outline"
						size="sm"
						className="h-7 px-2"
						onClick={handleReset}
						disabled={isSaving}
					>
						<RotateCcw className="mr-1 h-3.5 w-3.5" />
						Reset
					</Button>
					<Button
						variant="default"
						size="sm"
						className="h-7 px-2"
						onClick={handleSave}
						disabled={isSaving}
					>
						{isSaving ? (
							<div className="h-3.5 w-3.5 border-2 border-t-transparent border-white rounded-full animate-spin mr-1" />
						) : (
							<Save className="mr-1 h-3.5 w-3.5" />
						)}
						Save
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}