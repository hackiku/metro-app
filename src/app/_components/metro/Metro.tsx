// src/app/_components/metro/Metro.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { PlayerCard } from "./player/PlayerCard"
import { MetroMap, type MetroMapRef } from "./map/MetroMap"
import { fetchMetroLines, fetchStationDetails } from "./services/metroDataService"
import type { MetroLine, MetroStation, StationDetail } from "./types/metro"
import { StationDetailsDialog } from "./map/components/StationDetailsDialog"

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

	// When current station changes, update selection
	const handleSetCurrentStation = (station: MetroStation) => {
		setCurrentStation(station);
		setDetailsOpen(false);
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
		<div className="relative h-[calc(100dvh-4rem)] w-full bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed overflow-hidden">
			{/* Metro Map */}
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