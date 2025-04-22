// src/app/_components/metro/Metro.tsx
"use client"

import { useState, useRef, useEffect } from "react";
import { PlayerCard } from "./player/PlayerCard";
import { MetroMap, type MetroMapRef } from "./map/MetroMap";
import { fetchStationDetails } from "./services/dataService";
import type { StationDetail } from "./services/dataService";
import type { Station } from "./services/dataService";
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
	// Station state
	const [selectedStation, setSelectedStation] = useState<Station | null>(null);
	const [currentStation, setCurrentStation] = useState<Station | null>(null);
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
	const handleStationSelect = async (station: Station) => {
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
	const handleSetCurrentStation = (station: Station) => {
		setCurrentStation(station);
		setDetailsOpen(false);
	};

	return (
		<div className="relative h-[calc(100dvh-4rem)] w-full bg-background overflow-hidden">
			{/* MetroMap now handles its own data loading and rendering */}
			<MetroMap
				ref={metroMapRef}
				schema={schema}
				onStationSelect={handleStationSelect}
				selectedStation={selectedStation}
				currentStation={currentStation}
				activeCategory={activeSkillCategory}
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