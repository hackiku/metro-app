"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { CollapsibleSidebar } from "./CollapsibleSidebar";
import { OrganizationProvider } from "~/contexts/OrganizationContext";
import { UserProvider } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useUser } from "~/contexts/UserContext";
import { api } from "~/trpc/react";
import { useMediaQuery } from "~/hooks/use-media-query";

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

	// Check for mobile viewport
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Auto-collapse sidebar on mobile
	useEffect(() => {
		if (isMobile) {
			setIsCollapsed(true);
		}
	}, [isMobile]);

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

	// Handle toggling the sidebar collapse state
	const handleToggleCollapse = (collapsed: boolean) => {
		setIsCollapsed(collapsed);
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

					{/* Navbar */}
					<Navbar />

					{/* Main container with sidebar and content */}
					<div className="flex flex-1 overflow-hidden">
						{/* Sidebar with smooth transitions */}
						<div className={`
							transition-all duration-300 ease-in-out h-full
							${isCollapsed ? 'w-[60px]' : 'w-[240px]'}
						`}>
							<CollapsibleSidebar
								isCollapsed={isCollapsed}
								onToggleCollapse={handleToggleCollapse}
							/>
						</div>

						{/* Main content area */}
						<main className="flex-1 overflow-auto p-6 bg-neutral-100/50 dark:bg-neutral-900/40 rounded-3xl">
							{children}
						</main>
					</div>
				</div>
			</UserProvider>
		</OrganizationProvider>
	);
}