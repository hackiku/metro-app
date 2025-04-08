// src/app/_components/metro/MetroApp.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "~/components/ui/button"

import { Player } from "./player/Player"
import { PlayerCard } from "./player/PlayerCard"
import { MetroMap, type MetroMapRef } from "./d3/MetroMap"
import { fetchMetroLines, fetchStationDetails } from "./services/metroDataService"
import type { MetroLine, MetroStation, StationDetail, StationSkill, DevelopmentStep } from "./types/metro"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"

// Extend Window interface to store station coordinates
declare global {
	interface Window {
		_metroStationCoordinates?: Record<string, { x: number, y: number }>;
	}
}

interface MetroAppProps {
	activeSkillCategory: string;
	schema?: string;
}

export function MetroApp({ activeSkillCategory, schema = 'gasunie' }: MetroAppProps) {
	// Core state
	const [metroLines, setMetroLines] = useState<MetroLine[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [zoomLevel, setZoomLevel] = useState(100);

	// Station state
	const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
	const [currentStation, setCurrentStation] = useState<MetroStation | null>(null);
	const [stationDetails, setStationDetails] = useState<StationDetail | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [detailsLoading, setDetailsLoading] = useState(false);

	// Ref to access MetroMap methods
	const metroMapRef = useRef<MetroMapRef>(null);

	// Function to handle station selection
	const handleStationSelect = async (station: MetroStation) => {
		setSelectedStation(station);
		setDetailsOpen(true);
		setDetailsLoading(true);

		try {
			const details = await fetchStationDetails(station.id, schema);
			if (details) {
				setStationDetails(details);
			}
		} catch (error) {
			console.error("Error fetching station details:", error);
		} finally {
			setDetailsLoading(false);
		}
	};

	// Fetch metro lines and stations
	useEffect(() => {
		async function loadMetroData() {
			try {
				setIsLoading(true);
				const lines = await fetchMetroLines(schema);
				setMetroLines(lines);

				// Find a default current station (first station of first line)
				if (lines.length > 0 && lines[0].stations.length > 0) {
					setCurrentStation(lines[0].stations[0]);
				}
			} catch (error) {
				console.error('Error loading metro data:', error);
				setMetroLines([]);
			} finally {
				setIsLoading(false);
			}
		}

		loadMetroData();
	}, [activeSkillCategory, schema]);

	// Zoom control handlers
	const handleZoomIn = () => {
		if (metroMapRef.current) {
			metroMapRef.current.zoomIn();
		}
	};

	const handleZoomOut = () => {
		if (metroMapRef.current) {
			metroMapRef.current.zoomOut();
		}
	};

	const handleZoomReset = () => {
		if (metroMapRef.current) {
			metroMapRef.current.zoomReset();
		}
	};

	// Track zoom level changes
	const handleZoomChange = (transform: { k: number }) => {
		setZoomLevel(Math.round(transform.k * 100));
	};

	return (
		<div className="relative h-[calc(100dvh-4rem)] w-full bg-background overflow-hidden">
			{/* Metro Map */}
			<MetroMap
				ref={metroMapRef}
				lines={metroLines}
				isLoading={isLoading}
				onStationSelect={handleStationSelect}
				selectedStation={selectedStation}
				currentStation={currentStation}
				onZoomChange={handleZoomChange}
			/>

			{/* Player - only show when map is loaded */}
			{!isLoading && <Player currentStationId={currentStation?.id} />}

			{/* Player Card */}
			<PlayerCard />

			{/* Zoom controls */}
			<div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={handleZoomIn}
					className="bg-background/80 backdrop-blur-sm shadow-sm"
				>
					<ZoomIn className="h-4 w-4" />
					<span className="sr-only">Zoom In</span>
				</Button>

				<Button
					variant="outline"
					size="icon"
					onClick={handleZoomReset}
					className="bg-background/80 backdrop-blur-sm shadow-sm"
				>
					<RotateCcw className="h-4 w-4" />
					<span className="sr-only">Reset View</span>
				</Button>

				<Button
					variant="outline"
					size="icon"
					onClick={handleZoomOut}
					className="bg-background/80 backdrop-blur-sm shadow-sm"
				>
					<ZoomOut className="h-4 w-4" />
					<span className="sr-only">Zoom Out</span>
				</Button>

				<div className="text-xs text-center text-muted-foreground">
					{zoomLevel}%
				</div>
			</div>

			{/* Station Details Dialog */}
			<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-2xl">
					{detailsLoading ? (
						<div className="flex h-64 items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
							<span className="ml-2">Loading details...</span>
						</div>
					) : selectedStation && stationDetails ? (
						<>
							<DialogHeader>
								<DialogTitle className="flex items-center text-xl">
									{selectedStation.name}
									<Badge className="ml-2" variant="outline">Level {selectedStation.level}</Badge>
								</DialogTitle>
								<DialogDescription>
									{stationDetails.description}
								</DialogDescription>
							</DialogHeader>

							<div className="mt-4 space-y-6">
								{/* Skills Section */}
								<div>
									<h3 className="mb-2 font-medium">Key Skills Required</h3>
									{stationDetails.skills.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
											{stationDetails.skills.map((skill: StationSkill, index: number) => (
												<div key={index} className="flex items-center p-2 border rounded-md">
													<div className="mr-2">
														<div className="h-3 w-3 rounded-full"
															style={{
																backgroundColor:
																	skill.importance >= 4 ? 'var(--destructive)' :
																		skill.importance >= 3 ? 'var(--warning)' :
																			'var(--success)'
															}}
														/>
													</div>
													<div className="text-foreground">{skill.name}</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-sm text-muted-foreground">No specific skills information available</p>
									)}
								</div>

								{/* Development Steps */}
								<div>
									<h3 className="mb-2 font-medium">Development Path</h3>
									{stationDetails.developmentSteps.length > 0 ? (
										<div className="space-y-3">
											{stationDetails.developmentSteps.map((step: DevelopmentStep, index: number) => (
												<div key={index} className="p-3 border rounded-md bg-muted/40">
													<div className="flex justify-between items-center mb-1">
														<h4 className="font-medium">{step.name}</h4>
														<Badge>{step.type}</Badge>
													</div>
													<p className="text-sm text-muted-foreground">{step.description}</p>
													<p className="text-xs mt-2">Estimated duration: {step.duration} weeks</p>
												</div>
											))}
										</div>
									) : (
										<p className="text-sm text-muted-foreground">No development path information available</p>
									)}
								</div>

								{/* Next Steps Button */}
								<div className="flex justify-end">
									<Button
										onClick={() => {
											setCurrentStation(selectedStation);
											setDetailsOpen(false);
										}}
									>
										Set as Current Position
									</Button>
								</div>
							</div>
						</>
					) : (
						<div className="p-6 text-center">
							<p className="text-muted-foreground">Station information not available</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}