// src/app/hr/career-paths/ViewSelector.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { LayoutGrid, LayoutList, Table as TableIcon, Plus } from "lucide-react";

interface ViewSelectorProps {
	viewMode: "table" | "simple" | "details";
	onViewModeChange: (mode: "table" | "simple" | "details") => void;
	onAddPath: () => void;
	careerPathCount: number;
}

export function ViewSelector({
	viewMode,
	onViewModeChange,
	onAddPath,
	careerPathCount
}: ViewSelectorProps) {
	return (
		<div className="flex items-center justify-between mb-6">
			<div>
				<h1 className="text-2xl font-bold">Career Paths</h1>
				<p className="text-sm text-muted-foreground">
					{careerPathCount} career path{careerPathCount !== 1 ? 's' : ''} available
				</p>
			</div>

			<div className="flex items-center gap-3">
				<Tabs
					value={viewMode}
					onValueChange={(value) => onViewModeChange(value as "table" | "simple" | "details")}
					className="w-auto"
				>
					<TabsList>
						<TabsTrigger value="simple" className="flex items-center gap-1">
							<LayoutGrid className="h-4 w-4" />
							<span className="hidden sm:inline">Cards</span>
						</TabsTrigger>
						<TabsTrigger value="details" className="flex items-center gap-1">
							<LayoutList className="h-4 w-4" />
							<span className="hidden sm:inline">Details</span>
						</TabsTrigger>
						<TabsTrigger value="table" className="flex items-center gap-1">
							<TableIcon className="h-4 w-4" />
							<span className="hidden sm:inline">Table</span>
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<Button onClick={onAddPath}>
					<Plus className="mr-2 h-4 w-4" />
					<span className="hidden sm:inline">New Path</span>
				</Button>
			</div>
		</div>
	);
}