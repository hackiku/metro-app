// src/app/hr/positions/CareerPathPositionHeader.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ExternalLink, GripVertical, ChevronDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

// This would be replaced with a proper type from your API
interface CareerPath {
	id: string;
	name: string;
	description?: string | null;
	color?: string | null;
}

// This would be replaced with a proper type from your API
interface Position {
	id: string;
	name: string;
	level: number;
	sequence_in_path?: number | null;
}

interface CareerPathPositionHeaderProps {
	selectedPath: CareerPath;
	availablePaths: CareerPath[];
	pathPositions?: Position[];
	onPathChange: (pathId: string) => void;
	onTabChange?: (tab: string) => void;
	onAssignPosition: () => void;
}

export function CareerPathPositionHeader({
	selectedPath,
	availablePaths,
	pathPositions = [],
	onPathChange,
	onTabChange,
	onAssignPosition
}: CareerPathPositionHeaderProps) {
	const [activeTab, setActiveTab] = useState("assigned-positions");

	// Handle tab change
	const handleTabChange = (value: string) => {
		setActiveTab(value);
		if (onTabChange) {
			onTabChange(value);
		}
	};

	// Handle path selection change
	const handlePathChange = (value: string) => {
		onPathChange(value);
	};

	return (
		<div className="space-y-4">
			{/* Path Title Card with Dropdown and Tabs */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<Select value={selectedPath.id} onValueChange={handlePathChange}>
								<SelectTrigger className="w-[240px] border-0 p-0 h-auto shadow-none text-xl">
									<SelectValue placeholder="Select career path" />
								</SelectTrigger>
								<SelectContent>
									{availablePaths.map(path => (
										<SelectItem key={path.id} value={path.id}>
											{path.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<CardDescription>
								{selectedPath.description || "Career path and position management"}
							</CardDescription>
						</div>

						<div className="flex items-center gap-2">
							<Tabs
								value={activeTab}
								onValueChange={handleTabChange}
								className="w-auto"
							>
								<TabsList>
									<TabsTrigger value="assigned-positions">Assigned Positions</TabsTrigger>
									<TabsTrigger value="create-positions">Create Positions</TabsTrigger>
									<TabsTrigger value="skills" disabled>Skills</TabsTrigger>
								</TabsList>
							</Tabs>

							<Button variant="ghost" size="icon" asChild>
								<Link href={`/career-path/${selectedPath.id}`} target="_blank">
									<ExternalLink className="h-4 w-4" />
									<span className="sr-only">Open career path page</span>
								</Link>
							</Button>
						</div>
					</div>
				</CardHeader>

				{/* Draggable position list */}
				<CardContent>
					<div className="border rounded-md p-2 bg-muted/30 overflow-x-auto">
						<div className="flex items-center gap-2 min-w-max">
							{pathPositions.length === 0 ? (
								<div className="py-2 px-4 text-muted-foreground text-sm">
									No positions assigned to this path yet. Click "Assign Position" to add one.
								</div>
							) : (
								<>
									{pathPositions.map((position) => (
										<div
											key={position.id}
											className="flex items-center gap-1 px-3 py-2 bg-card rounded-md border shadow-sm cursor-grab"
											draggable="true"
											onDragStart={(e) => {
												// Placeholder for drag start logic
												e.dataTransfer.setData("text/plain", position.id);
											}}
										>
											<GripVertical className="h-4 w-4 text-muted-foreground" />
											<div className="flex items-center gap-2">
												<span className="font-medium">{position.name}</span>
												<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
													L{position.level}
												</span>
											</div>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
														<MoreHorizontal className="h-3 w-3" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>Edit Position</DropdownMenuItem>
													<DropdownMenuItem className="text-destructive">
														Remove from Path
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									))}
								</>
							)}

							<Button
								variant="outline"
								size="sm"
								className="ml-2 whitespace-nowrap"
								onClick={onAssignPosition}
							>
								Assign Position
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}