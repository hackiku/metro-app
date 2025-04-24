// src/app/hr/summary/SummaryResizable.tsx
"use client";

import { useState } from "react";
import {
	ResizablePanel,
	ResizablePanelGroup,
	ResizableHandle
} from "~/components/ui/resizable";
import MapPreview from "./MapPreview";
import ManagerCard from "./ManagerCard";
import SummaryStats from "./SummaryStats";
import { Button } from "~/components/ui/button";
import { Map } from "lucide-react";
import Link from "next/link";

interface SummaryResizableProps {
	organizationName?: string;
}

export default function SummaryResizable({ organizationName = "Veenie" }: SummaryResizableProps) {
	// Default panel size distribution
	const [leftPanelSize, setLeftPanelSize] = useState(65);
	const [rightPanelSize, setRightPanelSize] = useState(35);

	return (
		<ResizablePanelGroup direction="horizontal" className="rounded-lg border bg-card">
			<ResizablePanel
				defaultSize={leftPanelSize}
				minSize={30}
				maxSize={70}
				onResize={(size) => {
					setLeftPanelSize(size);
					setRightPanelSize(100 - size);
				}}
			>
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
					<div>
						<h1 className="text-2xl font-bold">HR Admin</h1>
						<p className="text-muted-foreground">
							Manage career paths, positions, and their relationships for {organizationName}
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Button asChild>
							<Link href="/metro">
								<Map className="mr-2 h-4 w-4" />
								View Metro Map
							</Link>
						</Button>
					</div>
				</div>

				<div className="px-6 pb-6">
					<div className="flex flex-col md:flex-row gap-4">
						<ManagerCard />
						<SummaryStats />
					</div>
				</div>
			</ResizablePanel>

			<ResizableHandle withHandle />

			<ResizablePanel
				defaultSize={rightPanelSize}
				minSize={25}
				maxSize={50}
			>
				<MapPreview />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}