"use client";

import { useState, useEffect } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup
} from "~/components/ui/resizable";
import { Navbar } from "./Navbar";
import { CollapsibleSidebar } from "./CollapsibleSidebar.tsx";

interface AppLayoutProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	// Keep track of sidebar collapsed state
	const [isCollapsed, setIsCollapsed] = useState(false);
	// Default sidebar width percentage
	const defaultSidebarSize = 25; // 15% of screen width
	// Threshold at which sidebar collapses (in %)
	const collapseThreshold = 12;

	// Handler for sidebar resize
	const handleSidebarResize = (size: number) => {
		setIsCollapsed(size < collapseThreshold);
	};

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
			<Navbar />

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

				<ResizableHandle withHandle className="w-1.5 bg-muted" />

				<ResizablePanel defaultSize={100 - defaultSidebarSize}>
					<main className="h-full overflow-auto">
						{children}
					</main>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}