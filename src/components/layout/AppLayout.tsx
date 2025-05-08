"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { OrganizationProvider } from "~/contexts/OrganizationContext";
import { UserProvider } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useUser } from "~/contexts/UserContext";
import { api } from "~/trpc/react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { DataDevTools } from "~/components/dev/DataDevTools"

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
				<div className="flex h-screen flex-col overflow-hidden bg-background/75 text-foreground">
					{/* Add synchronizer component to manage data consistency */}
					<OrgUserSynchronizer />

					{/* Universal Navbar - works for both mobile and desktop */}
					<Navbar />

					{/* Mobile Sidebar - only visible on mobile */}
					<MobileSidebar />

					{/* Main container with sidebar and content */}
					<div className="flex flex-1 overflow-hidden">
						{/* Desktop Sidebar - only visible on desktop, with added top padding */}
						<div className="hidden md:block h-full pt-2">
							<Sidebar
								isCollapsed={isCollapsed}
								onToggleCollapse={handleToggleCollapse}
								className="h-[calc(100%-8px)] rounded-tl-2xl"
							/>
						</div>

						{/* Main content area with curved corners */}
						{/* <main className="flex-1 m-2 md:m-3 md:ml-0 md:mb-0 overflow-hidden bg-neutral-100/50 dark:bg-neutral-900/30 */}
						<main className="flex-1 overflow-hidden bg-neutral-100/80 dark:bg-neutral-800/30
								rounded-tl-3xl rounded-bl-3xl">
							<div className="p-0 md:p-6 h-full overflow-auto">
								{children}
							</div>
						</main>
					</div>
				</div>
			</UserProvider>
		</OrganizationProvider>
	);
}