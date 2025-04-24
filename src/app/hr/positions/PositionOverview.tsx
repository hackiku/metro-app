// src/app/hr/positions/PositionOverview.tsx
"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	ChevronsRight,
	ChevronsLeft,
	Search,
	X
} from "lucide-react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { ColorPreview } from "~/components/ui/color-preview";
import { cn } from "~/lib/utils";

interface PositionOverviewProps {
	className?: string;
	onSelect?: (pathId: string, positionId: string) => void;
	initialCollapsed?: boolean;
}

export function PositionOverview({
	className,
	onSelect,
	initialCollapsed = false
}: PositionOverviewProps) {
	const { currentOrgId } = useSession();
	const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

	// Fetch career paths
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Fetch position data for all paths
	const allPositionsData = useAllPositionsData(currentOrgId, pathsQuery.data || []);

	// Toggle a path's expanded state
	const togglePathExpanded = (pathId: string) => {
		setExpandedPaths(prev => {
			const newSet = new Set(prev);
			if (newSet.has(pathId)) {
				newSet.delete(pathId);
			} else {
				newSet.add(pathId);
			}
			return newSet;
		});
	};

	// Filter positions based on search
	const filteredPaths = allPositionsData.filter(item => {
		if (!searchQuery) return true;

		const lowerQuery = searchQuery.toLowerCase();

		// Check if path name matches
		if (item.pathName.toLowerCase().includes(lowerQuery)) return true;

		// Check if any position in the path matches
		const positions = item.positions || [];
		return positions.some(p =>
			p.positions?.name?.toLowerCase().includes(lowerQuery) ||
			p.path_specific_description?.toLowerCase().includes(lowerQuery)
		);
	});

	// Handle click on a position
	const handlePositionClick = (pathId: string, positionId: string) => {
		if (onSelect) {
			onSelect(pathId, positionId);
		}
	};

	// Expand all paths that match search query
	useEffect(() => {
		if (searchQuery && allPositionsData.length > 0) {
			// Automatically expand paths with matching content
			const pathsToExpand = new Set(expandedPaths);

			allPositionsData.forEach(item => {
				const lowerQuery = searchQuery.toLowerCase();

				// Check if path name matches
				if (item.pathName.toLowerCase().includes(lowerQuery)) {
					pathsToExpand.add(item.pathId);
					return;
				}

				// Check if any position in the path matches
				const positions = item.positions || [];
				if (positions.some(p =>
					p.positions?.name?.toLowerCase().includes(lowerQuery) ||
					p.path_specific_description?.toLowerCase().includes(lowerQuery)
				)) {
					pathsToExpand.add(item.pathId);
				}
			});

			setExpandedPaths(pathsToExpand);
		}
	}, [searchQuery, allPositionsData, expandedPaths]);

	if (isCollapsed) {
		return (
			<div className={cn("flex flex-col items-center border rounded-md p-2", className)}>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsCollapsed(false)}
					className="mb-4"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<div className="rotate-90 text-xs text-muted-foreground whitespace-nowrap">
					POSITIONS OVERVIEW
				</div>
			</div>
		);
	}

	return (
		<Card className={cn("flex flex-col h-full", className)}>
			<CardHeader className="px-3 py-2 flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle className="text-sm">Positions Overview</CardTitle>
					<CardDescription className="text-xs">
						{pathsQuery.data
							? `${pathsQuery.data.length} career paths`
							: "Loading paths..."
						}
					</CardDescription>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsCollapsed(true)}
					className="h-7 w-7"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</CardHeader>

			<div className="px-3 pb-2">
				<div className="relative">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search positions..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-8 h-9 text-sm"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1 h-7 w-7"
							onClick={() => setSearchQuery("")}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			<CardContent className="p-0 flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div className="p-3 space-y-2">
						{pathsQuery.isLoading ? (
							<div className="text-sm text-muted-foreground text-center p-4">
								Loading career paths...
							</div>
						) : filteredPaths.length === 0 ? (
							<div className="text-sm text-muted-foreground text-center p-4">
								{searchQuery
									? "No matching positions found"
									: "No career paths available"
								}
							</div>
						) : (
							filteredPaths.map(item => (
								<div key={item.pathId} className="space-y-1">
									<button
										onClick={() => togglePathExpanded(item.pathId)}
										className="flex items-center w-full text-left rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted"
									>
										<ColorPreview
											color={item.pathColor || "#cccccc"}
											size="sm"
											className="mr-2"
										/>
										<span className="flex-1 truncate">{item.pathName}</span>
										<span className="text-xs text-muted-foreground">
											{item.positions?.length || 0}
										</span>
										<svg
											width="15"
											height="15"
											viewBox="0 0 15 15"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className={cn(
												"ml-1 h-4 w-4 text-muted-foreground transition-transform",
												expandedPaths.has(item.pathId) ? "transform rotate-90" : ""
											)}
										>
											<path
												d="M6 11L10 7.5L6 4"
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</button>

									{expandedPaths.has(item.pathId) && (
										<div className="pl-4 space-y-1">
											{item.isLoading ? (
												<div className="text-xs text-muted-foreground pl-2 py-1">
													Loading positions...
												</div>
											) : item.positions?.length === 0 ? (
												<div className="text-xs text-muted-foreground pl-2 py-1">
													No positions in this path
												</div>
											) : (
												item.positions?.map(position => {
													const positionName = position.positions?.name || "Unknown Position";
													const positionId = position.positions?.id;

													const shouldHighlight = searchQuery && (
														positionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
														position.path_specific_description?.toLowerCase().includes(searchQuery.toLowerCase())
													);

													return (
														<button
															key={position.id}
															onClick={() => positionId && handlePositionClick(item.pathId, positionId)}
															className={cn(
																"block w-full text-left px-2 py-1 rounded text-xs",
																shouldHighlight
																	? "bg-primary/10 font-medium"
																	: "hover:bg-muted/50"
															)}
														>
															<div className="flex items-center">
																<span className="mr-1.5 text-muted-foreground">L{position.level}</span>
																<span className="truncate flex-1">{positionName}</span>
															</div>
														</button>
													);
												})
											)}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>

			<CardFooter className="p-3 pt-0 border-t text-xs text-muted-foreground">
				Click on a position to view details
			</CardFooter>
		</Card>
	);
}

// Custom hook to fetch and organize all positions data
function useAllPositionsData(currentOrgId: string | null, paths: any[]) {
	// Create a query key for each path to fetch its positions
	const pathsWithPositions = paths.map(path => path.id);

	// Use useEffect to fetch and organize the data
	const [allPositionsData, setAllPositionsData] = useState<Array<{
		pathId: string;
		pathName: string;
		pathColor: string | null;
		positions: any[] | null;
		isLoading: boolean;
		error: Error | null;
	}>>([]);

	// Fetch positions data for each path
	const allPathsPositionsQuery = api.position.getAllPathsPositions.useQuery(
		{ organizationId: currentOrgId!, pathIds: pathsWithPositions },
		{
			enabled: !!currentOrgId && pathsWithPositions.length > 0,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Organize the data whenever the query result changes
	useEffect(() => {
		if (allPathsPositionsQuery.data) {
			const newData = paths.map(path => {
				const pathPositions = allPathsPositionsQuery.data
					? allPathsPositionsQuery.data.filter(p => p.career_path_id === path.id)
					: [];

				return {
					pathId: path.id,
					pathName: path.name,
					pathColor: path.color,
					positions: pathPositions,
					isLoading: false,
					error: null
				};
			});

			setAllPositionsData(newData);
		} else if (allPathsPositionsQuery.isLoading) {
			const loadingData = paths.map(path => ({
				pathId: path.id,
				pathName: path.name,
				pathColor: path.color,
				positions: null,
				isLoading: true,
				error: null
			}));

			setAllPositionsData(loadingData);
		} else if (allPathsPositionsQuery.error) {
			const errorData = paths.map(path => ({
				pathId: path.id,
				pathName: path.name,
				pathColor: path.color,
				positions: null,
				isLoading: false,
				error: allPathsPositionsQuery.error
			}));

			setAllPositionsData(errorData);
		}
	}, [allPathsPositionsQuery.data, allPathsPositionsQuery.isLoading, allPathsPositionsQuery.error, paths]);

	return allPositionsData;
}