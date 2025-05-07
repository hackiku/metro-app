// src/components/dev/cards/EntityCard.tsx
"use client";

import { useEffect, useState } from "react";
import { DataCard } from "./DataCard";
import { api } from "~/trpc/react";

interface EntityCardProps {
	entity: 'user' | 'organization' | 'position' | 'competence' | 'career_path';
	data: Record<string, any>;
	title?: string;
	category?: string;
}

// Map of field categories for each entity type
const entityFieldCategories: Record<string, Record<string, string[]>> = {
	user: {
		primary: ['id', 'full_name', 'email'],
		details: ['level', 'role', 'years_in_role'],
		relations: ['current_position_details_id'],
		metadata: ['created_at']
	},
	organization: {
		primary: ['id', 'name', 'description'],
		details: ['primary_color', 'secondary_color', 'logo_url'],
		metadata: ['created_at']
	},
	position: {
		primary: ['id', 'name', 'base_description'],
		relations: ['organization_id'],
		metadata: ['created_at']
	},
	competence: {
		primary: ['id', 'name', 'description'],
		details: ['category'],
		relations: ['organization_id'],
		metadata: ['created_at']
	},
	career_path: {
		primary: ['id', 'name', 'description'],
		details: ['color'],
		relations: ['organization_id'],
		metadata: ['created_at']
	}
};

export function EntityCard({ entity, data, title, category = 'primary' }: EntityCardProps) {
	const [editedData, setEditedData] = useState<Record<string, any>>(data);
	const utils = api.useUtils();

	// Get fields for this category and entity
	const getFields = () => {
		const categoryFields = entityFieldCategories[entity]?.[category] || [];
		// Filter to only fields that exist in the data
		return categoryFields.filter(field => field in data);
	};

	// Update edited data when prop data changes
	useEffect(() => {
		setEditedData(data);
	}, [data]);

	// Handle field change
	const handleFieldChange = (field: string, value: any) => {
		setEditedData(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Handle save based on entity type
	const handleSave = async () => {
		if (!editedData.id) {
			throw new Error("Entity ID is required for updates");
		}

		// Extract only changed fields
		const changedFields: Record<string, any> = {};
		Object.keys(editedData).forEach(key => {
			if (editedData[key] !== data[key]) {
				changedFields[key] = editedData[key];
			}
		});

		// Skip save if no changes
		if (Object.keys(changedFields).length === 0) {
			return;
		}

		const updateData = {
			id: editedData.id,
			...changedFields
		};

		// Update based on entity type
		switch (entity) {
			case 'user':
				await api.user.update.mutate(updateData);
				utils.user.getAll.invalidate();
				utils.user.getById.invalidate({ id: editedData.id });
				break;

			case 'organization':
				await api.organization.update.mutate(updateData);
				utils.organization.getAll.invalidate();
				utils.organization.getById.invalidate({ id: editedData.id });
				break;

			case 'position':
				await api.position.update.mutate(updateData);
				utils.position.getAll.invalidate();
				break;

			case 'competence':
				await api.competence.update.mutate(updateData);
				utils.competence.getAll.invalidate();
				break;

			case 'career_path':
				await api.career.updatePath.mutate(updateData);
				utils.career.getPaths.invalidate();
				break;

			default:
				throw new Error(`Unsupported entity type: ${entity}`);
		}
	};

	const fields = getFields();
	const cardTitle = title || `${category.charAt(0).toUpperCase() + category.slice(1)} Info`;

	return (
		<DataCard
			title={cardTitle}
			data={editedData}
			fields={fields}
			onChange={handleFieldChange}
			onSave={handleSave}
			category={category}
		/>
	);
}

