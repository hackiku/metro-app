// src/app/_components/metro/Metro.tsx
"use client"

import { useState, useRef, useEffect } from "react"
// import { Player } from "./player/Player"
import { PlayerCard } from "./player/PlayerCard"
import { MetroMap, type MetroMapRef } from "./d3/MetroMap"
import { fetchMetroLines, fetchStationDetails } from "./services/metroDataService"
import type { MetroLine, MetroStation, StationDetail } from "./types/metro"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

// Extend Window interface to store station coordinates
declare global {
	interface Window {
		_metroStationCoordinates?: Record<string, { x: number, y: number }>;
	}
}

interface MetroProps {
	activeSkillCategory: string;
	schema?: string;
}

export function Metro({ activeSkillCategory, schema = 'gasunie' }: MetroProps) {
	// Core state
	const [metroLines, setMetroLines] = useState<MetroLine[]>([]);
	const [isLoading, setIsLoading] = useState(true);

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
			/>

			{/* Player - only show when map is loaded */}
			{/* {!isLoading && <Player currentStationId={currentStation?.id} />} */}

			{/* Player Card */}
			<PlayerCard />

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
											{stationDetails.skills.map((skill, index) => (
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
											{stationDetails.developmentSteps.map((step, index) => (
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