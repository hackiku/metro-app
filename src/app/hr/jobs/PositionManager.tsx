// src/app/hr/jobs/PositionManager.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { PathSidebar } from "./PathSidebar";
import { PositionTable } from "./PositionTable";
import { InlinePositionForm } from "./InlinePositionForm";
import { InlineAssignForm } from "./InlineAssignForm";
import { toast } from "sonner";

export function PositionManager() {
	const { currentOrganization } = useOrganization();
	const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [formMode, setFormMode] = useState<"hidden" | "addPosition" | "editPosition" | "assignPosition">("hidden");
	const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
	const [reorderMode, setReorderMode] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [pendingOrderChanges, setPendingOrderChanges] = useState<Array<{ id: string, level: number, sequence: number }>>([]);

	// Get available paths
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	// Get current path details if selected
	const pathQuery = api.career.getPathById.useQuery(
		{ id: selectedPathId! },
		{ enabled: !!selectedPathId }
	);

	// Get utils for cache invalidation
	const utils = api.useUtils();

	// Reset form state when changing paths
	useEffect(() => {
		setFormMode("hidden");
		setSelectedPositionId(null);
		setReorderMode(false);
		setHasChanges(false);
		setPendingOrderChanges([]);
	}, [selectedPathId]);

	// Get selected path name
	const selectedPathName = selectedPathId
		? (pathQuery.data?.name || "Selected Career Path")
		: "All Positions";

	// Handle position selection
	const handleSelectPosition = (id: string) => {
		setSelectedPositionId(id);
	};

	// Handle position reordering
	const handlePositionReorder = (changes: Array<{ id: string, level: number, sequence: number }>) => {
		setPendingOrderChanges(changes);
		setHasChanges(true);
	};

	// Handle saving reordering changes
	const handleSaveChanges = async () => {
		if (!pendingOrderChanges.length) return;

		let successCount = 0;
		const total = pendingOrderChanges.length;

		for (const change of pendingOrderChanges) {
			try {
				await api.position.updatePositionDetail.mutate({
					id: change.id,
					level: change.level,
					sequenceInPath: change.sequence
				});
				successCount++;
			} catch (error) {
				console.error("Failed to update position order:", error);
			}
		}

		if (successCount === total) {
			toast.success("Position order updated successfully");
		} else {
			toast.warning(`Updated ${successCount} of ${total} positions`);
		}

		// Invalidate queries and reset state
		if (selectedPathId) {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrganization?.id!,
				careerPathId: selectedPathId
			});
		}

		setHasChanges(false);
		setPendingOrderChanges([]);
		setReorderMode(false);
	};

	// Handle form completion
	const handleFormComplete = () => {
		setFormMode("hidden");
		setSelectedPositionId(null);

		// Invalidate relevant queries
		utils.position.getAll.invalidate({ organizationId: currentOrganization?.id! });
		if (selectedPathId) {
			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrganization?.id!,
				careerPathId: selectedPathId
			});
		}
	};

	return (
		<Card className="mb-6">
			<CardHeader className="pb-2">
				<CardTitle className="text-xl">Position Management</CardTitle>
				<CardDescription>Manage all positions and their placement in career paths</CardDescription>
			</CardHeader>

			<div className="p-4 pt-0">
				<div className="grid grid-cols-4 gap-4">
					{/* Left sidebar with career paths */}
					<div className="col-span-1">
						<PathSidebar
							paths={pathsQuery.data || []}
							selectedPathId={selectedPathId}
							onSelectPath={setSelectedPathId}
							isLoading={pathsQuery.isLoading}
						/>
					</div>

					{/* Main content area */}
					<div className="col-span-3 space-y-4">
						{/* Only show the form if needed */}
						{formMode === "addPosition" && (
							<InlinePositionForm
								mode="create"
								onComplete={handleFormComplete}
								onCancel={() => setFormMode("hidden")}
							/>
						)}

						{formMode === "editPosition" && selectedPositionId && (
							<InlinePositionForm
								mode="edit"
								positionId={selectedPositionId}
								onComplete={handleFormComplete}
								onCancel={() => setFormMode("hidden")}
							/>
						)}

						{formMode === "assignPosition" && selectedPathId && (
							<InlineAssignForm
								careerPathId={selectedPathId}
								onComplete={handleFormComplete}
								onCancel={() => setFormMode("hidden")}
							/>
						)}

						{/* Main positions table */}
						<PositionTable
							selectedPathId={selectedPathId}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							onAddPosition={() => setFormMode("addPosition")}
							onEditPosition={(id) => {
								setSelectedPositionId(id);
								setFormMode("editPosition");
							}}
							onAssignPosition={() => setFormMode("assignPosition")}
							onSelectPosition={handleSelectPosition}
							onToggleReorderMode={() => setReorderMode(!reorderMode)}
							onPositionReorder={handlePositionReorder}
							onSaveChanges={handleSaveChanges}
							reorderMode={reorderMode}
							hasChanges={hasChanges}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}