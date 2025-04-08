// src/app/_components/metro/development/StationSelector.tsx
"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import type { MetroStation } from "../types/metro"

interface StationSelectorProps {
	stations: MetroStation[]
	currentStationId: string
	onSelect: (stationId: string) => void
	selectedStationId?: string
	className?: string
}

export function StationSelector({
	stations,
	currentStationId,
	onSelect,
	selectedStationId,
	className = ""
}: StationSelectorProps) {
	const [searchTerm, setSearchTerm] = useState("")
	const [levelFilter, setLevelFilter] = useState<string>("all")

	// Filter and sort stations
	const filteredStations = useMemo(() => {
		// Remove current station from options
		return stations
			.filter(station => station.id !== currentStationId)
			.filter(station => {
				// Apply search filter
				if (searchTerm) {
					return station.name.toLowerCase().includes(searchTerm.toLowerCase())
				}
				return true
			})
			.filter(station => {
				// Apply level filter
				if (levelFilter !== "all") {
					return station.level === parseInt(levelFilter, 10)
				}
				return true
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [stations, currentStationId, searchTerm, levelFilter])

	// Get unique levels for the filter dropdown
	const levels = useMemo(() => {
		const uniqueLevels = new Set<number>()
		stations.forEach(station => {
			uniqueLevels.add(station.level)
		})
		return Array.from(uniqueLevels).sort((a, b) => a - b)
	}, [stations])

	return (
		<div className={`flex flex-col gap-4 ${className}`}>
			<div className="relative">
				<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search stations..."
					className="pl-8"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className="flex gap-2">
				<Select
					value={levelFilter}
					onValueChange={setLevelFilter}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by level" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Levels</SelectItem>
						{levels.map(level => (
							<SelectItem key={level} value={level.toString()}>
								Level {level}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="mt-2 flex max-h-[200px] flex-col gap-2 overflow-y-auto">
				{filteredStations.length > 0 ? (
					filteredStations.map(station => (
						<Button
							key={station.id}
							variant={selectedStationId === station.id ? "default" : "outline"}
							className="justify-between text-left"
							onClick={() => onSelect(station.id)}
						>
							<div className="flex flex-col items-start">
								<span>{station.name}</span>
								<span className="text-xs text-muted-foreground">Level {station.level}</span>
							</div>
						</Button>
					))
				) : (
					<div className="text-center text-sm text-muted-foreground">
						No stations match your criteria
					</div>
				)}
			</div>
		</div>
	)
}