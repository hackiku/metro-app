// src/app/hr/HrAdminPage.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { RefreshCw, Map } from "lucide-react";
import { ActionsHeader } from "./components/ActionsHeader";
import CareerPaths from "./career-paths/CareerPaths";
import { AssignmentsList } from "./assignments/AssignmentsList";
import { PositionsList } from "./positions/PositionsList";
import { Toaster } from "sonner";
import Link from "next/link";
import { toast } from "sonner";
import { useOrganization } from "~/contexts/OrganizationContext";

export default function HrAdminPage() {
	// Get organization from context
	const { currentOrganization } = useOrganization();

	// State for tracking which career path is selected
	const [selectedCareerPathId, setSelectedCareerPathId] = useState<string | null>(null);

	// State for tracking active tab
	const [activeTab, setActiveTab] = useState<string>("all-positions");

	// State for tracking unsaved changes
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Basic check to ensure we have an organization ID
	if (!currentOrganization) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">
					No organization selected. Please select an organization from the dropdown.
				</p>
			</div>
		);
	}

	// Handle global refresh
	const handleRefresh = () => {
		// Invalidate all queries
		utils.career.getPaths.invalidate();
		utils.position.getAll.invalidate();
		utils.position.getByCareerPath.invalidate();
		toast.success("Data refreshed");
	};

	// Handle selecting a different career path
	const handleSelectPath = (id: string | null) => {
		// Check for unsaved changes before changing path
		if (hasUnsavedChanges) {
			if (confirm("You have unsaved changes. Are you sure you want to switch paths?")) {
				setSelectedCareerPathId(id);
				if (id) {
					setActiveTab("assigned-positions");
				} else {
					setActiveTab("all-positions");
				}
				setHasUnsavedChanges(false);
			}
		} else {
			setSelectedCareerPathId(id);
			if (id) {
				setActiveTab("assigned-positions");
			} else {
				setActiveTab("all-positions");
			}
		}
	};

	// Handle tab change
	const handleTabChange = (tab: string) => {
		// Check for unsaved changes before changing tab
		if (hasUnsavedChanges && tab !== activeTab) {
			if (confirm("You have unsaved changes. Are you sure you want to switch tabs?")) {
				setActiveTab(tab);
				if (tab === "all-positions") {
					setSelectedCareerPathId(null);
				}
				setHasUnsavedChanges(false);
			}
		} else {
			setActiveTab(tab);
			if (tab === "all-positions") {
				setSelectedCareerPathId(null);
			}
		}
	};

	// Handle changes notification from AssignmentsList
	const handleChangesUpdate = (hasChanges: boolean) => {
		setHasUnsavedChanges(hasChanges);
	};

	// Handle save changes - properly create and dispatch event
	const handleSaveChanges = () => {
		// Create and dispatch a custom event that will be caught by AssignmentsList
		const saveEvent = new CustomEvent('save-positions');
		document.dispatchEvent(saveEvent);
		setHasUnsavedChanges(false);
	};

	// Handle reset changes - properly create and dispatch event
	const handleResetChanges = () => {
		// Create and dispatch a custom event that will be caught by AssignmentsList
		const resetEvent = new CustomEvent('reset-positions');
		document.dispatchEvent(resetEvent);
		setHasUnsavedChanges(false);
	};

	return (
		<div className="space-y-6 p-6">
			{/* Actions row */}
			<div className="flex gap-3 justify-end">
				<Button variant="outline" size="sm" onClick={handleRefresh}>
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh Data
				</Button>

				<div className="flex items-center gap-3">
					<Button asChild size="sm" variant="default">
						<Link href="/metro">
							<Map className="mr-2 h-4 w-4" />
							View Metro Map
						</Link>
					</Button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="space-y-6">
				{/* Career Paths Table with selectable rows */}
				<CareerPaths
					onSelectPath={handleSelectPath}
					selectedPathId={selectedCareerPathId}
				/>

				{/* Actions Header with Tabs */}
				<ActionsHeader
					selectedPathId={selectedCareerPathId}
					onTabChange={handleTabChange}
					activeTab={activeTab}
					onPathSelect={handleSelectPath}
					hasChanges={hasUnsavedChanges}
					onSaveChanges={handleSaveChanges}
					onResetChanges={handleResetChanges}
				/>

				{/* Content based on active tab */}
				<div className="mt-6">
					{activeTab === "all-positions" && (
						<PositionsList />
					)}

					{activeTab === "assigned-positions" && selectedCareerPathId && (
						<AssignmentsList
							careerPathId={selectedCareerPathId}
							onChangesUpdate={handleChangesUpdate}
							onSave={handleSaveChanges}
							onReset={handleResetChanges}
						/>
					)}
				</div>
			</div>

			{/* Toast container for notifications */}
			<Toaster />
		</div>
	);
}