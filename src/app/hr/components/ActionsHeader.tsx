// src/app/hr/components/ActionsHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { ColorPreview } from "~/components/ui/color-preview";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

interface ActionsHeaderProps {
	selectedPathId: string | null;
	onTabChange: (tab: string) => void;
	activeTab: string;
	onPathSelect?: (id: string) => void;
}

export function ActionsHeader({
	selectedPathId,
	onTabChange,
	activeTab,
	onPathSelect
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
	const handlePathChange = (value: string) => {
		if (onPathSelect) {
			onPathSelect(value);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-4 flex-1">
					<div className="flex-1 flex items-center gap-3">
						{selectedPathId && selectedPath && !isLoading ? (
							<>
								<ColorPreview color={selectedPath.color || "#cccccc"} size="md" />
								<Select value={selectedPathId} onValueChange={handlePathChange}>
									<SelectTrigger className="text-lg font-semibold border-0 shadow-none min-w-[200px] max-w-[300px] h-auto p-0">
										<SelectValue placeholder="Select career path">
											{selectedPath.name}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{careerPaths?.map(path => (
											<SelectItem key={path.id} value={path.id}>
												<div className="flex items-center gap-2">
													<ColorPreview color={path.color || "#cccccc"} size="xs" />
													<span>{path.name}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						) : (
							<Select value="" onValueChange={handlePathChange}>
								<SelectTrigger className="text-lg font-semibold border-0 shadow-none min-w-[200px] h-auto p-0">
									<SelectValue placeholder="Position Management">
										Position Management
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{careerPaths?.map(path => (
										<SelectItem key={path.id} value={path.id}>
											<div className="flex items-center gap-2">
												<ColorPreview color={path.color || "#cccccc"} size="xs" />
												<span>{path.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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

					{selectedPath?.description && (
						<p className="text-sm text-muted-foreground hidden md:block">{selectedPath.description}</p>
					)}
				</div>

				<Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
					<TabsList className="grid w-full grid-cols-3 min-w-[300px]">
						<TabsTrigger value="all-positions" disabled={!!selectedPathId}>
							All Positions
						</TabsTrigger>
						<TabsTrigger value="assigned-positions" disabled={!selectedPathId}>
							Assigned Positions
						</TabsTrigger>
						<TabsTrigger value="skills" disabled>
							Skills
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</CardHeader>
		</Card>
	);
}