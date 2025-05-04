// src/app/hr/components/ActionsHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ExternalLink, ChevronDown, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { ColorPreview } from "~/components/ui/color-preview";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface ActionsHeaderProps {
	selectedPathId: string | null;
	onTabChange: (tab: string) => void;
	activeTab: string;
	onPathSelect?: (id: string | null) => void;
	hasChanges?: boolean;
	onSaveChanges?: () => void;
	onResetChanges?: () => void;
}

export function ActionsHeader({
	selectedPathId,
	onTabChange,
	activeTab,
	onPathSelect,
	hasChanges = false,
	onSaveChanges,
	onResetChanges
}: ActionsHeaderProps) {
	// Fetch all career paths for the dropdown
	const { data: careerPaths, isLoading: pathsLoading } = api.career.getPaths.useQuery(
		{ organizationId: "a73148de-90e1-4f0e-955d-9790c131e13c" }, // TODO: Get current org ID dynamically
		{ staleTime: 1000 * 60 * 5 } // 5 minutes
	);

	// Fetch the specific career path details if one is selected
	const { data: selectedPath, isLoading } = api.career.getPathById.useQuery(
		{ id: selectedPathId! },
		{
			enabled: !!selectedPathId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Handle path selection from dropdown
	const handlePathChange = (value: string | null) => {
		if (onPathSelect) {
			onPathSelect(value);
		}
	};

	// Properly handle save changes with direct function call
	const handleSaveClick = () => {
		if (onSaveChanges) {
			onSaveChanges();
		}
	};

	// Properly handle reset changes with direct function call
	const handleResetClick = () => {
		if (onResetChanges) {
			onResetChanges();
		}
	};

	return (
		<>
			<Card className="mb-3">
				<CardHeader className="pb-0 flex flex-row items-center justify-between space-y-0">
					<div className="flex-1 flex items-center gap-3">
						{selectedPathId && selectedPath && !isLoading ? (
							<>
								<ColorPreview color={selectedPath.color || "#cccccc"} size="md" />
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="lg" className="text-xl font-semibold p-0 flex items-center gap-2">
											{selectedPath.name}
											<ChevronDown className="h-4 w-4 opacity-50" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56">
										<DropdownMenuLabel>Career Paths</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											{careerPaths?.map(path => (
												<DropdownMenuItem key={path.id} onClick={() => handlePathChange(path.id)}>
													<div className="flex items-center gap-2">
														<ColorPreview color={path.color || "#cccccc"} size="xs" />
														<span>{path.name}</span>
													</div>
												</DropdownMenuItem>
											))}
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => handlePathChange(null)}>
											<span>Clear Selection</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="lg" className="text-xl font-semibold p-0 flex items-center gap-2">
										Position Management
										<ChevronDown className="h-4 w-4 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>Select Career Path</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										{careerPaths?.map(path => (
											<DropdownMenuItem key={path.id} onClick={() => handlePathChange(path.id)}>
												<div className="flex items-center gap-2">
													<ColorPreview color={path.color || "#cccccc"} size="xs" />
													<span>{path.name}</span>
												</div>
											</DropdownMenuItem>
										))}
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{selectedPathId && selectedPath && (
							<Button variant="outline" size="sm" asChild className="ml-2">
								<Link href={`/career-path/${selectedPathId}`} target="_blank">
									<ExternalLink className="mr-2 h-4 w-4" />
									View Path
								</Link>
							</Button>
						)}
					</div>

					<Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
						<TabsList className="grid w-full grid-cols-2 min-w-[300px]">
							<TabsTrigger
								value="all-positions"
								onClick={() => {
									if (selectedPathId) {
										handlePathChange(null);
									}
								}}
							>
								All Positions
							</TabsTrigger>
							<TabsTrigger
								value="assigned-positions"
								disabled={!selectedPathId}
							>
								Assigned Positions
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</CardHeader>

				<div className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
					<div className="text-sm text-muted-foreground">
						{selectedPathId && selectedPath ? (
							<>
								{selectedPath.description || "Manage positions in this career path"}
								{activeTab === "assigned-positions" && (
									<span className="ml-2">
										(Drag positions to reorder)
									</span>
								)}
							</>
						) : (
							"Manage all position titles in your organization"
						)}
					</div>

					{activeTab === "assigned-positions" && selectedPathId && (
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleResetClick}
								disabled={!hasChanges}
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Reset
							</Button>
							<Button
								size="sm"
								onClick={handleSaveClick}
								disabled={!hasChanges}
							>
								<Save className="mr-2 h-4 w-4" />
								Save Changes
							</Button>
						</div>
					)}
				</div>
			</Card>
		</>
	);
}