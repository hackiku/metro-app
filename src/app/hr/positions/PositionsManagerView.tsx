// src/app/hr/positions/PositionsManagerView.tsx

"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Search, Plus, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PositionDialog } from "./PositionDialog";
import { AssignPositionDialog } from "./AssignPositionDialog";

// Import the table and other required components
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "~/components/ui/table";

export function PositionsManagerView() {
	const { currentOrganization } = useOrganization();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
	const [isCreatingPosition, setIsCreatingPosition] = useState(false);
	const [isAssigningPosition, setIsAssigningPosition] = useState(false);
	const [editingPosition, setEditingPosition] = useState<string | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// TRPC queries for data
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	// Positions for selected path (if any)
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrganization?.id!,
			careerPathId: selectedPathId!
		},
		{ enabled: !!currentOrganization?.id && !!selectedPathId }
	);

	// Get utils for invalidation
	const utils = api.useUtils();

	// Filter positions based on search query and selected path
	const filteredPositions = useMemo(() => {
		let positions = positionsQuery.data || [];

		// Filter by search query
		if (searchQuery) {
			positions = positions.filter(p =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.base_description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return positions;
	}, [positionsQuery.data, searchQuery]);

	// Handle save changes
	const handleSaveChanges = () => {
		// Implement save logic using TRPC
		toast.success("Changes saved successfully");
		setHasUnsavedChanges(false);
	};

	// Handle reset changes
	const handleResetChanges = () => {
		// Implement reset logic
		toast.info("Changes reset");
		setHasUnsavedChanges(false);
	};

	// Render the component
	return (
		<div className="space-y-4">
			{/* Career Path Sidebar and Positions Table layout */}
			<div className="grid grid-cols-4 gap-4">
				{/* Left Sidebar - Career Paths */}
				<div className="col-span-1 border rounded-md p-4">
					<div className="mb-4">
						<Input
							placeholder="Filter career paths..."
							value={pathSearchQuery}
							onChange={(e) => setPathSearchQuery(e.target.value)}
							className="mb-2"
						/>
					</div>

					{/* All Positions option */}
					<div
						className={`p-2 rounded-md cursor-pointer mb-2 ${!selectedPathId ? 'bg-muted' : 'hover:bg-muted/50'}`}
						onClick={() => setSelectedPathId(null)}
					>
						<span className="font-medium">All Positions</span>
					</div>

					{/* Career Paths List */}
					<div className="space-y-1">
						{(pathsQuery.data || []).map(path => (
							<div
								key={path.id}
								className={`p-2 rounded-md cursor-pointer flex items-center ${selectedPathId === path.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
								onClick={() => setSelectedPathId(path.id)}
							>
								<div
									className="h-3 w-3 rounded-full mr-2"
									style={{ backgroundColor: path.color || '#ccc' }}
								/>
								<span>{path.name}</span>
							</div>
						))}
					</div>
				</div>

				{/* Right Content - Positions Table */}
				<div className="col-span-3 border rounded-md p-4">
					{/* Action Bar */}
					<div className="flex justify-between items-center mb-4">
						<div className="flex-1">
							<h3 className="text-lg font-medium">
								{selectedPathId
									? pathsQuery.data?.find(p => p.id === selectedPathId)?.name || "Selected Path"
									: "All Positions"}
							</h3>
							<p className="text-sm text-muted-foreground">
								{selectedPathId
									? "Manage positions in this career path"
									: "View and manage all positions"}
							</p>
						</div>

						<div className="flex items-center gap-2">
							{selectedPathId && hasUnsavedChanges && (
								<>
									<Button variant="outline" size="sm" onClick={handleResetChanges}>
										<RotateCcw className="mr-2 h-4 w-4" />
										Reset
									</Button>
									<Button size="sm" onClick={handleSaveChanges}>
										<Save className="mr-2 h-4 w-4" />
										Save Changes
									</Button>
								</>
							)}

							<Button
								onClick={() => selectedPathId
									? setIsAssigningPosition(true)
									: setIsCreatingPosition(true)
								}
							>
								<Plus className="mr-2 h-4 w-4" />
								{selectedPathId ? "Assign Position" : "Add Position"}
							</Button>
						</div>
					</div>

					{/* Search and Filter */}
					<div className="relative w-full max-w-sm mb-4">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search positions..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
					</div>

					{/* Positions Table */}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Position Name</TableHead>
								<TableHead>Description</TableHead>
								{selectedPathId && <TableHead>Level</TableHead>}
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{/* Render positions based on filter */}
							{/* Include logic for assignment status, editing, etc. */}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Modals for position creation/editing/assignment */}
			<PositionDialog
				open={isCreatingPosition}
				mode="create"
				onOpenChange={setIsCreatingPosition}
				onComplete={() => {
					setIsCreatingPosition(false);
					utils.position.getAll.invalidate();
				}}
			/>

			{editingPosition && (
				<PositionDialog
					open={!!editingPosition}
					mode="edit"
					positionId={editingPosition}
					onOpenChange={(open) => !open && setEditingPosition(null)}
					onComplete={() => {
						setEditingPosition(null);
						utils.position.getAll.invalidate();
					}}
				/>
			)}

			{selectedPathId && (
				<AssignPositionDialog
					open={isAssigningPosition}
					careerPathId={selectedPathId}
					onOpenChange={setIsAssigningPosition}
					onComplete={() => {
						setIsAssigningPosition(false);
						utils.position.getByCareerPath.invalidate({
							organizationId: currentOrganization?.id!,
							careerPathId: selectedPathId
						});
					}}
				/>
			)}
		</div>
	);
}