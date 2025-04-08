// src/app/_components/metro/development/DevelopmentView.tsx
"use client"

import { useState, useEffect } from "react"
import { fetchDevelopmentJourney } from "../services/developmentService"
import { StationSelector } from "./StationSelector"
import { JourneyCard } from "./JourneyCard"
import type { MetroStation } from "../types/metro"
import type { DevelopmentJourney } from "../types/development"
import { Button } from "~/components/ui/button"
import { ArrowRight } from "lucide-react"

interface DevelopmentViewProps {
	currentStationId: string
	metroStations: MetroStation[]
	schema?: string
}

export function DevelopmentView({
	currentStationId,
	metroStations,
	schema = 'gasunie'
}: DevelopmentViewProps) {
	const [journey, setJourney] = useState<DevelopmentJourney | null>(null)
	const [targetStationId, setTargetStationId] = useState<string>("")
	const [isLoading, setIsLoading] = useState(false)

	// Load initial journey data with just the current station
	useEffect(() => {
		async function loadInitialJourney() {
			try {
				setIsLoading(true)
				// Just fetch the basic journey with the current station
				const initialJourney = await fetchDevelopmentJourney(currentStationId, currentStationId, schema)
				setJourney(initialJourney)
			} catch (error) {
				console.error("Error loading initial journey:", error)
			} finally {
				setIsLoading(false)
			}
		}

		if (currentStationId) {
			loadInitialJourney()
		}
	}, [currentStationId, schema])

	// When target station changes, fetch the full journey
	useEffect(() => {
		async function loadFullJourney() {
			if (!targetStationId || targetStationId === currentStationId) return

			try {
				setIsLoading(true)
				const journeyData = await fetchDevelopmentJourney(currentStationId, targetStationId, schema)
				setJourney(journeyData)
			} catch (error) {
				console.error("Error loading journey:", error)
			} finally {
				setIsLoading(false)
			}
		}

		if (targetStationId) {
			loadFullJourney()
		}
	}, [targetStationId, currentStationId, schema])

	const handleStationSelect = (stationId: string) => {
		setTargetStationId(stationId)
	}

	return (
		<div className="flex h-full flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Development Journey</h2>
				<Button variant="outline" size="sm">View on Map</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Current Position */}
				<div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm">
					<h3 className="mb-2 text-lg font-medium">Your Current Position</h3>
					<div className="text-xl font-bold">{journey?.currentStation.name || "Loading..."}</div>
					<div className="text-sm text-muted-foreground">Level {journey?.currentStation.level || 1}</div>
					<p className="mt-4 text-sm">{journey?.currentStation.description || ""}</p>
				</div>

				{/* Target Position */}
				<div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm">
					<h3 className="mb-2 text-lg font-medium">Select Target Position</h3>
					<StationSelector
						stations={metroStations}
						currentStationId={currentStationId}
						onSelect={handleStationSelect}
						selectedStationId={targetStationId}
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="mt-8 flex items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
					<span className="ml-2">Loading journey details...</span>
				</div>
			) : journey && journey.targetStation ? (
				<div className="flex flex-col gap-2">
					<div className="flex items-center">
						<h3 className="text-xl font-bold">Your Development Path</h3>
						<div className="ml-4 flex items-center text-sm text-muted-foreground">
							<span>Estimated time: {journey.estimatedMonths} months</span>
						</div>
					</div>
					<div className="flex items-center text-sm">
						<div className="font-medium">{journey.currentStation.name}</div>
						<ArrowRight className="mx-2 h-4 w-4" />
						<div className="font-medium">{journey.targetStation.name}</div>
					</div>

					<JourneyCard
						journey={journey}
						className="mt-4"
					/>
				</div>
			) : null}
		</div>
	)
}