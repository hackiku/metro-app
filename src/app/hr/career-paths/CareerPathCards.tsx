// src/app/hr/career-paths/CareerPathCards.tsx
"use client";

import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ChevronRight, Network } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CareerPath } from "~/types/compass";

interface CareerPathCardsProps {
	careerPaths: CareerPath[];
	selectedPathId: string | null;
	onSelectPath: (id: string) => void;
	isLoading?: boolean;
}

export function CareerPathCards({
	careerPaths,
	selectedPathId,
	onSelectPath,
	isLoading = false
}: CareerPathCardsProps) {
	// Create a color dot component for consistent display
	const ColorDot = ({ color }: { color: string | null }) => (
		<div
			className="h-3 w-3 rounded-full border"
			style={{ backgroundColor: color || "#cccccc" }}
		/>
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card
						key={i}
						className="h-48 animate-pulse bg-muted p-6"
					/>
				))}
			</div>
		);
	}

	// Empty state
	if (careerPaths.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed">
				<Network className="h-12 w-12 text-muted-foreground mb-4" />
				<h3 className="text-lg font-medium">No Career Paths</h3>
				<p className="text-sm text-muted-foreground max-w-sm mt-1">
					Create a career path to start mapping out progression tracks for your organization.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{careerPaths.map((path) => (
				<Card
					key={path.id}
					className={cn(
						"group flex h-full cursor-pointer flex-col justify-between p-4 transition-all hover:shadow-md",
						selectedPathId === path.id ? "ring-2 ring-primary ring-offset-2" : ""
					)}
					onClick={() => onSelectPath(path.id)}
				>
					<div>
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<ColorDot color={path.color} />
								<span className="font-medium">{path.name}</span>
							</div>
						</div>

						<p className="text-sm text-muted-foreground line-clamp-3 mb-4">
							{path.description || "No description provided."}
						</p>

						{/* We could add position counts or other metadata here */}
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline" className="text-xs">
								Career Path
							</Badge>
							{/* If you had position count, you could add something like: */}
							{/* <Badge variant="secondary" className="text-xs">
                10 positions
              </Badge> */}
						</div>
					</div>

					<div className="mt-4 flex items-center justify-end pt-2 text-sm text-primary">
						View details
						<ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</div>
				</Card>
			))}
		</div>
	);
}