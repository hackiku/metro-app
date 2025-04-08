// src/app/_components/metro/development/DestinationSelector.tsx
"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "~/components/ui/select"
import { Target, Map } from "lucide-react"
import type { MetroStation } from "../types/metro"

interface DestinationSelectorProps {
	stations: MetroStation[];
	currentStationId: string;
	onSelectDestination: (stationId: string) => void;
	className?: string;
}

export function DestinationSelector({
	stations,
	currentStationId,
	onSelectDestination,
	className = ""
}: DestinationSelectorProps) {
	const [selectedStationId, setSelectedStationId] = useState<string>("");

	const handleStationChange = (value: string) => {
		setSelectedStationId(value);
	};

	const handleSetDestination = () => {
		if (selectedStationId) {
			onSelectDestination(selectedStationId);
		}
	};

	// Filter out current station
	const availableStations = stations.filter(
		station => station.id !== currentStationId
	).sort((a, b) => a.name.localeCompare(b.name));

	return (
		<div className={`space-y-2 ${className}`}>
			<h3 className="text-sm font-medium">Set Career Destination</h3>

			<Select value={selectedStationId} onValueChange={handleStationChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select destination" />
				</SelectTrigger>
				<SelectContent>
					{availableStations.map(station => (
						<SelectItem key={station.id} value={station.id}>
							<div className="flex items-center justify-between">
								<span>{station.name}</span>
								<span className="ml-2 text-xs text-muted-foreground">Level {station.level}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Button
				size="sm"
				className="w-full"
				disabled={!selectedStationId}
				onClick={handleSetDestination}
			>
				<Target className="mr-2 h-4 w-4" />
				Set as Destination
			</Button>
		</div>
	);
}