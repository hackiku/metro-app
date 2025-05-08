// src/components/layout/AppLayout.tsx

"use client";

import { useState, useEffect } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup
} from "~/components/ui/resizable";
import { Navbar } from "./Navbar";
import { CollapsibleSidebar } from "./CollapsibleSidebar";
import { AppSidebar } from "./Sidebar";
import { OrganizationProvider } from "~/contexts/OrganizationContext";
import { UserProvider } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useUser } from "~/contexts/UserContext";
import { api } from "~/trpc/react";
import { Sidebar } from "lucide-react";

// Component to handle synchronization between organization and user data
function OrgUserSynchronizer() {
	const { currentOrganization } = useOrganization();
	const { currentUser } = useUser();
	const utils = api.useUtils();

	// When organization changes, pre-fetch organization members
	useEffect(() => {
		if (currentOrganization?.id) {
			// Pre-fetch organization members to improve loading experience
			utils.organization.getMembers.prefetch({ organizationId: currentOrganization.id });
		}
	}, [currentOrganization?.id, utils.organization.getMembers]);

	// Watch for mismatches between org and user
	useEffect(() => {
		if (currentOrganization && currentUser) {
			// Ensure data is fresh when both organization and user are selected
			utils.organization.getMembers.invalidate({ organizationId: currentOrganization.id });
		}
	}, [currentOrganization?.id, currentUser?.id, utils.organization.getMembers]);

	// This is just a synchronization component - it doesn't render anything
	return null;
}

interface AppLayoutProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	// Client-side rendering check
	const [isClient, setIsClient] = useState(false);

	// Keep track of sidebar collapsed state
	const [isCollapsed, setIsCollapsed] = useState(false);
	// Default sidebar width percentage
	const defaultSidebarSize = 4; // 15% of screen width
	// Threshold at which sidebar collapses (in %)
	const collapseThreshold = 10;

	// Ensure we're only rendering on the client side
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get saved IDs from localStorage
	const getSavedId = (key: string): string | null => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem(key);
		}
		return null;
	};

	// Handler for sidebar resize
	const handleSidebarResize = (size: number) => {
		setIsCollapsed(size < collapseThreshold);
	};

	// Show loading state when not on client
	if (!isClient) {
		return (
			<div className="h-screen flex items-center justify-center bg-background">
				<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
			</div>
		);
	}

	return (
		<OrganizationProvider defaultOrgId={getSavedId('currentOrgId')}>
			<UserProvider defaultUserId={getSavedId('currentUserId')}>
				<div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
					{/* Add synchronizer component to manage data consistency */}
					<OrgUserSynchronizer />
					<Navbar />


					{/* <AppSidebar /> */}

					<ResizablePanelGroup
						direction="horizontal"
						className="flex-1"
					>
						<ResizablePanel
							defaultSize={defaultSidebarSize}
							minSize={4}
							maxSize={25}
							onResize={handleSidebarResize}
							className="border-r"
						>
							<CollapsibleSidebar isCollapsed={isCollapsed} />
						</ResizablePanel>

						<ResizableHandle withHandle className="w-[0.2px] bg-muted" />

						<ResizablePanel defaultSize={100 - defaultSidebarSize}>
							<main className="h-full overflow-auto">
								{children}
							</main>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</UserProvider>
		</OrganizationProvider>
	);
}