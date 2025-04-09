// src/app/_components/metro/Metro.tsx
"use client"

import { useState, useRef, useEffect } from "react";
import { PlayerCard } from "./player/PlayerCard";
import { MetroMap, type MetroMapRef } from "./map/MetroMap";
import { fetchMetroLines, fetchStationDetails } from "./services/metroDataService";
import type { MetroLine, MetroStation, StationDetail } from "./types/metro";
import { StationDetailsDialog } from "./map/components/StationDetailsDialog";

// Extend Window interface to store station coordinates
declare global {
	interface Window {
		_metroStationCoordinates?: Record<string, { x: number; y: number }>;
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

	// Mounted status tracking
	const isMountedRef = useRef(true);

	// Set mounted flag on component mount and clean up on unmount
	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Function to handle station selection
	const handleStationSelect = async (station: MetroStation) => {
		setSelectedStation(station);
		setDetailsOpen(true);
		setDetailsLoading(true);

		try {
			const details = await fetchStationDetails(station.id, schema);

			// Only update state if component is still mounted
			if (isMountedRef.current && details) {
				setStationDetails(details);
			}
		} catch (error) {
			console.error("Error fetching station details:", error);
		} finally {
			// Only update state if component is still mounted
			if (isMountedRef.current) {
				setDetailsLoading(false);
			}
		}
	};

	// When current station changes, update selection
	const handleSetCurrentStation = (station: MetroStation) => {
		setCurrentStation(station);
		setDetailsOpen(false);
	};

	// Fetch metro lines and stations with cleanup handling
	useEffect(() => {
		// For cancellation tracking
		let isActive = true;

		async function loadMetroData() {
			try {
				setIsLoading(true);

				// Fetch lines from the API
				const lines = await fetchMetroLines(schema);

				// Only update state if component is still active
				if (isActive) {
					setMetroLines(lines);

					// Find a default current station (first station of first line)
					if (lines.length > 0 && lines[0].stations.length > 0) {
						setCurrentStation(lines[0].stations[0]);
					}
				}
			} catch (error) {
				console.error('Error loading metro data:', error);

				if (isActive) {
					setMetroLines([]);
				}
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		}

		// Start loading data
		loadMetroData();

		// Cleanup function
		return () => {
			isActive = false;
		};
	}, [activeSkillCategory, schema]);

	return (
		<div className="relative h-[calc(100dvh-4rem)] w-full bg-background overflow-hidden">
			{/* Metro Map - now handles its own loading state */}
			<MetroMap
				ref={metroMapRef}
				lines={metroLines}
				isLoading={isLoading}
				onStationSelect={handleStationSelect}
				selectedStation={selectedStation}
				currentStation={currentStation}
			/>

			{/* Player Card */}
			<PlayerCard />

			{/* Station Details Dialog */}
			<StationDetailsDialog
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
				station={selectedStation}
				details={stationDetails}
				isLoading={detailsLoading}
				onSetCurrentStation={handleSetCurrentStation}
			/>
		</div>
	);
}