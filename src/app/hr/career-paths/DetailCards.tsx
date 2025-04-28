// src/app/hr/career-paths/DetailCards.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Badge } from "~/components/ui/badge";
import { Briefcase, ChevronRight, Network } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CareerPath } from "~/types/compass";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface PositionDetail {
	id: string;
	level: number;
	sequence_in_path?: number;
	path_specific_description: string | null;
	positions?: {
		id: string;
		name: string;
		base_description: string | null;
	} | null;
}

interface CareerPathWithPositions extends CareerPath {
	positions?: PositionDetail[];
	positionsLoading?: boolean;
}

interface DetailCardsProps {
	careerPaths: CareerPath[];
	selectedPathId: string | null;
	onSelectPath: (id: string) => void;
	isLoading?: boolean;
}

export function DetailCards({
	careerPaths,
	selectedPathId,
	onSelectPath,
	isLoading = false
}: DetailCardsProps) {
	const { currentOrgId } = useSession();
	const [expandedPaths, setExpandedPaths] = useState<Record<string, CareerPathWithPositions>>({});

	// Helper to determine if a path is currently being loading
	const isPathLoading = (pathId: string): boolean => {
		return !!expandedPaths[pathId]?.positionsLoading;
	};

	// Create a color dot component for consistent display
	const ColorDot = ({ color }: { color: string | null }) => (
		<div
			className="h-3 w-3 rounded-full border"
			style={{ backgroundColor: color || "#cccccc" }}
		/>
	);

	// When selected path changes, mark it as loading if we need to fetch data
	useEffect(() => {
		if (selectedPathId && !expandedPaths[selectedPathId]) {
			setExpandedPaths(prev => ({
				...prev,
				[selectedPathId]: {
					...(careerPaths.find(p => p.id === selectedPathId) || {}),
					positionsLoading: true
				} as CareerPathWithPositions
			}));
		}
	}, [selectedPathId, expandedPaths, careerPaths]);

	// Use tRPC hook to fetch position data for selected path
	useEffect(() => {
		if (selectedPathId && expandedPaths[selectedPathId]?.positionsLoading) {
			const fetchPositions = async () => {
				try {
					// Make a direct API call through the react-query client
					const result = await api.position.getByCareerPath.query({
						organizationId: currentOrgId!,
						careerPathId: selectedPathId
					});

					// Update with fetched positions
					setExpandedPaths(prev => ({
						...prev,
						[selectedPathId]: {
							...(prev[selectedPathId] || {}),
							positions: result,
							positionsLoading: false
						}
					}));
				} catch (error) {
					console.error("Error fetching positions:", error);
					// Update state to show error
					setExpandedPaths(prev => ({
						...prev,
						[selectedPathId]: {
							...(prev[selectedPathId] || {}),
							positions: [],
							positionsLoading: false
						}
					}));
				}
			};

			fetchPositions();
		}
	}, [selectedPathId, expandedPaths, currentOrgId, api.position.getByCareerPath]);

	// Loading state
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="h-48 animate-pulse bg-muted p-6 rounded-lg"
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
			{careerPaths.map((path) => {
				const isSelected = selectedPathId === path.id;
				const positionData = expandedPaths[path.id]?.positions;
				const isPositionsLoading = isPathLoading(path.id);

				// Sort positions by level if available
				const sortedPositions = positionData ?
					[...positionData].sort((a, b) => {
						const levelDiff = a.level - b.level;
						if (levelDiff !== 0) return levelDiff;
						return (a.sequence_in_path || a.level) - (b.sequence_in_path || b.level);
					}) : [];

				return (
					<div
						key={path.id}
						className={cn(
							"group flex h-full cursor-pointer flex-col justify-between p-4 transition-all hover:shadow-md rounded-lg border bg-card",
							isSelected ? "ring-2 ring-primary ring-offset-2" : ""
						)}
						onClick={() => onSelectPath(path.id)}
					>
						<div>
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<ColorDot color={path.color} />
									<span className="font-medium text-lg">{path.name}</span>
								</div>
							</div>

							<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
								{path.description || "No description provided."}
							</p>

							{/* Positions visualization */}
							<div className="mt-4 mb-2">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">Positions</span>
									<Badge variant="outline" className="text-xs">
										{isPositionsLoading ? "Loading..." :
											sortedPositions?.length > 0 ? `${sortedPositions.length} positions` : "No positions"}
									</Badge>
								</div>

								{isPositionsLoading ? (
									<div className="flex items-center justify-center h-10">
										<div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full" />
									</div>
								) : sortedPositions && sortedPositions.length > 0 ? (
									<div className="space-y-1.5">
										{/* Show up to 3 positions */}
										{sortedPositions.slice(0, 3).map((position) => (
											<div key={position.id} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/50 text-xs">
												<Briefcase className="h-3 w-3 text-muted-foreground" />
												<span className="font-medium">{position.positions?.name}</span>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger>
															<Badge variant="secondary" className="text-[10px] h-4">
																L{position.level}
															</Badge>
														</TooltipTrigger>
														<TooltipContent>
															<p className="text-xs">Level {position.level}</p>
															{position.sequence_in_path && position.sequence_in_path !== position.level && (
																<p className="text-xs">Sequence: {position.sequence_in_path}</p>
															)}
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										))}

										{/* Show "more" indicator if there are more positions */}
										{sortedPositions.length > 3 && (
											<div className="text-xs text-muted-foreground text-center py-1">
												+ {sortedPositions.length - 3} more positions
											</div>
										)}
									</div>
								) : (
									<div className="text-xs text-muted-foreground text-center p-2 border border-dashed rounded-md">
										No positions assigned yet
									</div>
								)}
							</div>
						</div>

						<div className="mt-2 flex items-center justify-end pt-2 text-sm text-primary">
							View details
							<ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</div>
					</div>
				);
			})}
		</div>
	);
}