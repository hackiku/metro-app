// src/app/hr/career-paths/CareersList.tsx
"use client";

import { ActionTable, type Column } from "~/components/tables/ActionTable";
import { ColorPreview } from "~/components/ui/color-preview";
import type { CareerPath } from "~/types/compass";

interface CareersListProps {
	careerPaths: CareerPath[];
	isLoading: boolean;
	selectedPathId: string | null;
	onSelectPath: (id: string | null) => void;
	onAddPath: () => void;
	onEditPath: (id: string) => void;
	onDeletePath: (id: string) => void;
}

export function CareersList({
	careerPaths,
	isLoading,
	selectedPathId,
	onSelectPath,
	onAddPath,
	onEditPath,
	onDeletePath
}: CareersListProps) {
	// Define columns for the table
	const columns: Column<CareerPath>[] = [
		{
			key: "name",
			header: "Name & Description",
			width: "w-[70%]",
			render: (path) => (
				<div className="flex items-center gap-3">
					<ColorPreview color={path.color || "#cccccc"} size="sm" />
					<div>
						<div className="font-medium">{path.name}</div>
						{path.description && (
							<div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
								{path.description}
							</div>
						)}
					</div>
				</div>
			)
		},
		{
			key: "positions",
			header: "Positions",
			width: "w-[20%]",
			render: () => <span className="text-muted-foreground">—</span> // Placeholder for future position count
		}
	];

	// Handle row click to select/deselect a path
	const handleRowClick = (id: string) => {
		if (selectedPathId === id) {
			onSelectPath(null);
		} else {
			onSelectPath(id);
		}
	};

	return (
		<ActionTable
			data={careerPaths}
			columns={columns}
			isLoading={isLoading}
			selectedId={selectedPathId}
			onRowClick={handleRowClick}
			primaryAction={{
				label: "Add New Career Path",
				onClick: onAddPath
			}}
			rowActions={{
				edit: {
					label: "Edit",
					onClick: onEditPath
				},
				delete: {
					label: "Delete",
					onClick: onDeletePath
				}
			}}
			emptyState={{
				title: "No Career Paths Yet",
				description: "Career paths help organize positions into clear progression tracks",
				action: {
					label: "Create Your First Path",
					onClick: onAddPath
				}
			}}
		/>
	);
}