// src/app/hr/career-paths/CareerPathHeader.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ExternalLink, Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import Link from "next/link";

interface CareerPathHeaderProps {
	careerPathCount: number;
	viewMode: "table" | "cards";
	onViewModeChange: (mode: "table" | "cards") => void;
	onAddPath: () => void;
}

export function CareerPathHeader({
	careerPathCount,
	viewMode,
	onViewModeChange,
	onAddPath
}: CareerPathHeaderProps) {
	return (
		<Card className="mb-4">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<h1 className="text-2xl font-bold">Career Paths</h1>
						<p className="text-sm text-muted-foreground">
							{careerPathCount} career path{careerPathCount !== 1 ? 's' : ''} available
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Tabs
							value={viewMode}
							onValueChange={(value) => onViewModeChange(value as "table" | "cards")}
							className="w-auto"
						>
							<TabsList>
								<TabsTrigger value="cards" className="flex items-center gap-1">
									<LayoutGrid className="h-4 w-4" />
									<span className="hidden sm:inline">Cards</span>
								</TabsTrigger>
								<TabsTrigger value="table" className="flex items-center gap-1">
									<TableIcon className="h-4 w-4" />
									<span className="hidden sm:inline">Table</span>
								</TabsTrigger>
							</TabsList>
						</Tabs>

						<Button onClick={onAddPath}>
							<Plus className="mr-2 h-4 w-4" />
							New Path
						</Button>

						<Button variant="ghost" size="icon" asChild>
							<Link href="/career-paths" target="_blank">
								<ExternalLink className="h-4 w-4" />
								<span className="sr-only">View all career paths</span>
							</Link>
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-4">
				<p className="text-sm text-muted-foreground">
					Career paths define progression tracks for employees. Select a career path to manage its positions.
				</p>
			</CardContent>
		</Card>
	);
}