// src/app/hr/career-paths/CareersList.tsx
"use client";

import { EnhancedExpandableTable } from "~/components/tables/EnhancedExpandableTable";
import { DraggablePositions } from "../components/DraggablePositions";
import { ColorPreview } from "~/components/ui/color-preview";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { useEffect, useState } from "react";
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
	const { currentOrgId } = useSession();

	// Fetch positions count for each path
	const pathPositionsCountQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrgId!,
			careerPathId: selectedPathId || ''
		},
		{
			enabled: !!currentOrgId && !!selectedPathId,
			staleTime: 30000 // 30 seconds
		}
	);

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
				// Show count if this is the selected path and we have data
				if (selectedPathId === path.id && pathPositionsCountQuery.data) {
					const count = pathPositionsCountQuery.data.length;
					return (
						<Badge variant="outline" className="text-xs">
							{count} position{count !== 1 ? 's' : ''}
						</Badge>
					);
				}
				return <span className="text-muted-foreground">—</span>;
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
		// Only render DraggablePositions for the selected path
		if (path.id !== selectedPathId) {
			return (
				<div className="text-center p-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onSelectPath(path.id)}
					>
						View Positions
					</Button>
				</div>
			);
		}

		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium">Positions in {path.name}</h3>
					<Button asChild variant="outline" size="sm">
						<Link href={`/career-path/${path.id}`} target="_blank">
							<ExternalLink className="mr-2 h-4 w-4" />
							View Career Path Page
						</Link>
					</Button>
				</div>

				<DraggablePositions
					careerPathId={path.id}
					onAssignPosition={() => {
						if (onAssignPosition) {
							onAssignPosition(path.id);
						}
					}}
				/>
			</div>
		);
	};

	return (
		<EnhancedExpandableTable
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