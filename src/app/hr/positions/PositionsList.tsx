// src/app/hr/positions/PositionsList.tsx
"use client";

import { ActionTable, type Column } from "~/components/tables/ActionTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface Position {
	id: string;
	name: string;
	base_description: string | null;
	// Add other position fields as needed
}

interface PositionsListProps {
	positions?: Position[];
	isLoading?: boolean;
	onAddPosition: () => void;
	onEditPosition: (id: string) => void;
	onDeletePosition: (id: string) => void;
}

export function PositionsList({
	positions,
	isLoading = false,
	onAddPosition,
	onEditPosition,
	onDeletePosition
}: PositionsListProps) {
	// Define columns for the table
	const columns: Column<Position>[] = [
		{
			key: "name",
			header: "Position Name",
			width: "w-[40%]",
			render: (position) => (
				<div className="font-medium">{position.name}</div>
			)
		},
		{
			key: "description",
			header: "Description",
			width: "w-[60%]",
			render: (position) => (
				<div className="text-sm text-muted-foreground line-clamp-2">
					{position.base_description || "No description provided."}
				</div>
			)
		}
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-xl">PositionsList</CardTitle>
						<CardDescription>
							{!isLoading && positions && (
								positions.length === 0
									? "No positions available. Create your first one!"
									: `${positions.length} positions available`
							)}
						</CardDescription>
					</div>
					<Button onClick={onAddPosition}>
						<Plus className="mr-2 h-4 w-4" />
						New Position
					</Button>
				</div>
			</CardHeader>

			<CardContent>
				<ActionTable
					data={positions || []}
					columns={columns}
					isLoading={isLoading}
					primaryAction={{
						label: "Add New Position",
						onClick: onAddPosition
					}}
					rowActions={{
						edit: {
							label: "Edit",
							onClick: onEditPosition
						},
						delete: {
							label: "Delete",
							onClick: onDeletePosition
						}
					}}
					emptyState={{
						title: "No Positions Yet",
						description: "Create position titles that can be assigned to career paths",
						action: {
							label: "Create Your First Position",
							onClick: onAddPosition
						}
					}}
				/>
			</CardContent>
		</Card>
	);
}