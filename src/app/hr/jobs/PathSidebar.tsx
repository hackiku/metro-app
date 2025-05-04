// src/app/hr/jobs/PathSidebar.tsx

"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import type { CareerPath } from "~/types/compass";

interface PathSidebarProps {
	paths: CareerPath[];
	selectedPathId: string | null;
	onSelectPath: (id: string | null) => void;
	isLoading?: boolean;
}

export function PathSidebar({
	paths,
	selectedPathId,
	onSelectPath,
	isLoading = false
}: PathSidebarProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Filter paths by search query
	const filteredPaths = paths.filter(path =>
		path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		path.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-9 w-full" />
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full" />
				))}
			</div>
		);
	}

	return (
		<div className="border rounded-md">
			<div className="p-3 border-b">
				<Input
					placeholder="Search career paths..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="text-sm"
				/>
			</div>

			<ScrollArea className="h-[calc(100vh-350px)] min-h-[250px]">
				<div className="space-y-0.5 p-2">
					{/* "All Positions" option */}
					<div
						className={`px-3 py-2 rounded-md cursor-pointer ${selectedPathId === null ? 'bg-muted font-medium' : 'hover:bg-muted/50'
							}`}
						onClick={() => onSelectPath(null)}
					>
						All Positions
					</div>

					{/* Path list */}
					{filteredPaths.length > 0 ? (
						filteredPaths.map(path => (
							<div
								key={path.id}
								className={`px-3 py-2 rounded-md cursor-pointer flex items-center ${selectedPathId === path.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'
									}`}
								onClick={() => onSelectPath(path.id)}
							>
								<div
									className="h-3 w-3 rounded-full mr-2"
									style={{ backgroundColor: path.color || '#cccccc' }}
								/>
								<span className="truncate">{path.name}</span>
							</div>
						))
					) : (
						<div className="px-3 py-2 text-sm text-muted-foreground">
							{searchQuery ? 'No matching paths found' : 'No career paths available'}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}