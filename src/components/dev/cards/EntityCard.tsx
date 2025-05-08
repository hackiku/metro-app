// src/components/dev/cards/EntityCard.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Save, RotateCcw, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { entityFieldCategories } from "../utils/entityHandler";
import { CopyJsonButton } from "../buttons/CopyJsonButton";
import { cn } from "~/lib/utils";

interface EntityCardProps {
	entity: 'user' | 'organization' | 'position' | 'competence' | 'career_path';
	data: Record<string, any>;
	title?: string;
	category?: string;
}

export function EntityCard({ entity, data, title, category = 'primary' }: EntityCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [editedData, setEditedData] = useState<Record<string, any>>({ ...data });
	const utils = api.useUtils();

	// Initialize ALL possible mutations
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
			utils.position.getAllDetails.invalidate({ organizationId: data.organization_id });
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
	const getFields = () => {
		const categoryFields = entityFieldCategories[entity]?.[category] || [];
		return categoryFields.filter(field => {
			if (field.includes('.')) {
				const [parent, child] = field.split('.');
				return data[parent] && data[parent][child] !== undefined;
			}
			return field in data;
		});
	};

	useEffect(() => {
		setEditedData({ ...data });
		setHasChanges(false);
	}, [data]);

	const handleFieldChange = (field: string, value: any) => {
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

	const formatFieldName = (field: string) => {
		const parts = field.split('.');
		const fieldName = parts[parts.length - 1];
		return fieldName
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const getFieldValue = (field: string) => {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			return editedData[parent]?.[child];
		}
		return editedData[field];
	};

	const handleSave = async () => {
		if (!hasChanges) return;

		try {
			if (entity === 'user') {
				updateUserMutation.mutate({
					id: editedData.id,
					full_name: editedData.full_name,
					email: editedData.email,
					level: editedData.level,
					years_in_role: parseFloat(editedData.years_in_role),
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
				updatePositionDetailMutation.mutate({
					id: editedData.id,
					level: parseInt(editedData.level, 10),
					sequenceInPath: editedData.sequence_in_path ? parseInt(editedData.sequence_in_path, 10) : undefined,
					pathSpecificDescription: editedData.path_specific_description,
					workFocus: editedData.work_focus,
					teamInteraction: editedData.team_interaction,
					workStyle: editedData.work_style
				});
			} else if (entity === 'competence') {
				updateUserCompetenceMutation.mutate({
					userId: editedData.user_id || data.user_id,
					competenceId: editedData.competence?.id,
					currentLevel: parseInt(editedData.current_level, 10),
					targetLevel: editedData.target_level ? parseInt(editedData.target_level, 10) : null
				});
			} else if (entity === 'career_path') {
				updateCareerPlanMutation.mutate({
					id: editedData.id,
					status: editedData.status,
					estimatedTotalDuration: editedData.estimated_total_duration,
					notes: editedData.notes
				});
			} else {
				throw new Error(`No save handler for entity type: ${entity}`);
			}
		} catch (error) {
			console.error("Error initiating save:", error);
			toast.error(`Failed to initiate save: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const handleReset = () => {
		setEditedData({ ...data });
		setHasChanges(false);
	};

	const renderField = (field: string) => {
		const value = getFieldValue(field);

		if (isEditing) {
			if (field === 'id' || field.endsWith('_id') || field === 'created_at' || field === 'updated_at') {
				return (
					<div className="p-2 bg-muted/30 rounded-md text-sm break-all text-muted-foreground">
						{value === null || value === undefined ? 'null' : String(value)}
					</div>
				);
			}
			if (typeof value === 'boolean') {
				return (
					<select
						value={value ? "true" : "false"}
						onChange={(e) => handleFieldChange(field, e.target.value === "true")}
						className="p-2 bg-muted/30 rounded-md text-sm w-full border border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
					>
						<option value="true">True</option>
						<option value="false">False</option>
					</select>
				);
			}
			if (field === 'years_in_role' || field === 'level' || field === 'sequence_in_path' || field === 'current_level' || field === 'target_level') {
				return (
					<input
						type="number"
						value={value || ''}
						onChange={(e) => handleFieldChange(field, e.target.value === '' ? null : Number(e.target.value))}
						className="p-2 bg-muted/20 rounded-md text-sm w-full border border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
					/>
				);
			}
			return (
				<input
					value={value !== null && value !== undefined ? String(value) : ''}
					onChange={(e) => handleFieldChange(field, e.target.value)}
					className="p-2 bg-muted/20 rounded-md text-sm w-full border border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
				/>
			);
		}
		return (
			<div className="p-2 bg-muted/20 rounded-md text-sm break-all">
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

	const getCategoryColor = () => {
		switch (category) {
			case "primary": return "border-t-primary/30";
			case "details": return "border-t-blue-500/30";
			case "relations": return "border-t-amber-500/30";
			case "metadata": return "border-t-slate-500/30";
			default: return "border-t-gray-500/30";
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
		<Card className={cn(
			"overflow-hidden transition-all border-t-2 hover:bg-background/50",
			getCategoryColor(),
			isEditing && "border border-primary/30 bg-primary/5"
		)}>
			<CardHeader className="flex flex-row items-center justify-between p-3">
				<CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
				<div className="flex items-center gap-1">
					<CopyJsonButton
						jsonData={Object.fromEntries(
							fields.map(field => [field, getFieldValue(field)])
						)}
						tooltipText={`Copy ${cardTitle} as JSON`}
					/>
					<Button
						variant={isEditing ? "outline" : "ghost"}
						size="icon"
						className={cn(
							"h-7 w-7 rounded-full",
							isEditing && "border-primary text-primary"
						)}
						onClick={() => setIsEditing(!isEditing)}
					>
						{isEditing ? (
							<Eye className="h-3.5 w-3.5" />
						) : (
							<Edit className="h-3.5 w-3.5" />
						)}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-3 space-y-2">
				{fields.length === 0 ? (
					<div className="text-sm text-muted-foreground italic">No fields to display</div>
				) : (
					fields.map(field => (
						<div key={field} className="space-y-0.5">
							<div className="text-xs flex justify-between items-center">
								<span className="font-medium text-foreground/80">{formatFieldName(field)}</span>
								{(field === 'id' || field.endsWith('_id') || field === 'created_at' || field === 'updated_at') && (
									<Badge variant="outline" className="text-[9px] h-4 px-1">read-only</Badge>
								)}
							</div>
							{renderField(field)}
						</div>
					))
				)}
			</CardContent>
			{hasChanges && (
				<CardFooter className="flex justify-end gap-2 py-2 px-3 bg-primary/5 border-t border-primary/20">
					<Button
						variant="outline"
						size="sm"
						className="h-7 px-2 rounded-md"
						onClick={handleReset}
						disabled={isSaving}
					>
						<RotateCcw className="mr-1 h-3 w-3" />
						Reset
					</Button>
					<Button
						variant="default"
						size="sm"
						className="h-7 px-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
						onClick={handleSave}
						disabled={isSaving}
					>
						{isSaving ? (
							<div className="h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin mr-1" />
						) : (
							<Save className="mr-1 h-3 w-3" />
						)}
						Save
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}