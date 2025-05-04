// src/app/hr/career-paths/CareersList.tsx
"use client";

import { ExpandableTable } from "~/components/tables/ExpandableTable";
import { DraggablePositions } from "../components/DraggablePositions";
import { ColorPreview } from "~/components/ui/color-preview";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
// import { useSession } from "~/contexts/SessionContext";
import { useOrganization } from "~/contexts/OrganizationContext";

import { useState, useEffect } from "react";
import type { CareerPath } from "~/types/compass";

interface CareersListProps {
	careerPaths: CareerPath[];
	isLoading: boolean;
	selectedPathId: string | null;
	onSelectPath: (id: string | null) => void;
	onAddPath: () => void;
	onEditPath: (id: string) => void;
	onDeletePath: (id: string) => void;
	onAssignPosition?: (pathId: string) => void;
}

export function CareersList({
	careerPaths,
	isLoading,
	selectedPathId,
	onSelectPath,
	onAddPath,
	onEditPath,
	onDeletePath,
	onAssignPosition
}: CareersListProps) {
	const { currentOrganization } = useOrganization();
	const [positionCounts, setPositionCounts] = useState<Record<string, number>>({});

	// Fetch positions count for all paths
	const allPathsPositionsQuery = api.position.getAllPathsPositions.useQuery(
		{
			organizationId: currentOrganization?.id || '', // Only pass the ID
			pathIds: careerPaths.map(path => path.id)
		},
		{
			enabled: !!currentOrganization?.id && careerPaths.length > 0,
			staleTime: 30000 // 30 seconds
		}
	);

	// Process position counts when data loads
	useEffect(() => {
		if (allPathsPositionsQuery.data) {
			const counts: Record<string, number> = {};

			// Count positions by path ID
			allPathsPositionsQuery.data.forEach(position => {
				const pathId = position.career_path_id;
				if (!counts[pathId]) {
					counts[pathId] = 0;
				}
				counts[pathId]++;
			});

			setPositionCounts(counts);
		}
	}, [allPathsPositionsQuery.data]);

	// Set up event listener for assign position action from DraggablePositions
	useEffect(() => {
		const handleAssignPosition = (event: Event) => {
			const customEvent = event as CustomEvent;
			if (customEvent.detail && customEvent.detail.pathId && onAssignPosition) {
				onAssignPosition(customEvent.detail.pathId);
			}
		};

		document.addEventListener('assign-position', handleAssignPosition);

		return () => {
			document.removeEventListener('assign-position', handleAssignPosition);
		};
	}, [onAssignPosition]);

	// Define columns for the table
	const columns = [
		{
			key: "name",
			header: "Name & Description",
			width: "w-[70%]",
			render: (path: CareerPath) => (
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
			render: (path: CareerPath) => {
				const count = positionCounts[path.id] || 0;
				return (
					<Badge variant="outline" className="text-xs">
						{count}
					</Badge>
				);
			}
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

	// Handle edit click with event
	const handleEditClick = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onEditPath(id);
	};

	// Handle delete click with event
	const handleDeleteClick = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onDeletePath(id);
	};

	// Render the expanded content with positions
	const renderExpandedContent = (path: CareerPath) => {
		return (
			<DraggablePositions
				careerPathId={path.id}
				pathColor={path.color}
			/>
		);
	};

	return (
		<ExpandableTable
			data={careerPaths}
			columns={columns}
			isLoading={isLoading}
			selectedId={selectedPathId}
			onRowClick={handleRowClick}
			onEditClick={handleEditClick}
			onDeleteClick={handleDeleteClick}
			primaryAction={{
				label: "Add New Career Path",
				onClick: onAddPath
			}}
			renderExpanded={renderExpandedContent}
			getRowUrl={(id) => `/career-path/${id}`}
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