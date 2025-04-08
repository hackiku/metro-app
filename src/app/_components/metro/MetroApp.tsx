// src/app/_components/metro/MetroApp.tsx
"use client"

import { useEffect, useState, useRef } from "react"

import { Player } from "./player/Player"
import { PlayerCard } from "./player/PlayerCard"

import { MetroMap } from "./d3/MetroMap"
import { ZoomControls } from "./controls/ZoomControls"
import { fetchMetroLines, fetchStationDetails } from "./services/metroDataService"
import type { MetroLine, MetroStation, StationDetail, StationSkill, DevelopmentStep } from "./types/metro"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog"

interface MetroAppProps {
	activeSkillCategory: string
	schema?: string
}

export function MetroApp({ activeSkillCategory, schema = 'gasunie' }: MetroAppProps) {
	const [metroLines, setMetroLines] = useState<MetroLine[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null)
	const [stationDetails, setStationDetails] = useState<StationDetail | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [detailsLoading, setDetailsLoading] = useState(false)
	const [zoom, setZoom] = useState(1)

	const zoomRef = useRef<{ k: number, x: number, y: number }>({ k: 1, x: 0, y: 0 })
	const svgRef = useRef<SVGSVGElement>(null)

	// Function to handle station selection
	const handleStationSelect = async (station: MetroStation) => {
		setSelectedStation(station)
		setDetailsOpen(true)
		setDetailsLoading(true)

		try {
			const details = await fetchStationDetails(station.id, schema)
			if (details) {
				setStationDetails(details)
			}
		} catch (error) {
			console.error("Error fetching station details:", error)
		} finally {
			setDetailsLoading(false)
		}
	}

	// Fetch metro lines and stations
	useEffect(() => {
		async function loadMetroData() {
			try {
				setIsLoading(true)
				const lines = await fetchMetroLines(schema)
				setMetroLines(lines)
			} catch (error) {
				console.error('Error loading metro data:', error)
				setMetroLines([])
			} finally {
				setIsLoading(false)
			}
		}

		loadMetroData()
	}, [activeSkillCategory, schema])

	// Zoom control handlers
	const handleZoomIn = () => {
		if (svgRef.current && zoomRef.current) {
			zoomRef.current.k = Math.min(5, zoomRef.current.k * 1.2)
			setZoom(zoomRef.current.k)
		}
	}

	const handleZoomOut = () => {
		if (svgRef.current && zoomRef.current) {
			zoomRef.current.k = Math.max(0.5, zoomRef.current.k / 1.2)
			setZoom(zoomRef.current.k)
		}
	}

	const handleZoomReset = () => {
		if (svgRef.current) {
			zoomRef.current = { k: 1, x: 0, y: 0 }
			setZoom(1)
		}
	}

	// Handle zoom changes from D3
	const handleZoomChange = (transform: { k: number, x: number, y: number }) => {
		zoomRef.current = transform
		setZoom(transform.k)
	}

	return (
		<div className="relative h-[calc(100dvh-4rem)] w-full bg-background overflow-hidden">
			{/* 4rem is the height of your navbar */}
			<MetroMap
				lines={metroLines}
				isLoading={isLoading}
				onStationSelect={handleStationSelect}
				selectedStation={selectedStation}
				stationDetails={stationDetails}
			/>
			<Player />

			<PlayerCard />


			{/* Zoom controls */}
			<div className="absolute top-4 right-4 z-10">
				
				{/* <ZoomControls
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onReset={handleZoomReset}
					zoom={zoom}
				/> */}
			</div>

			{/* Station Details Dialog */}
			<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-2xl">
					{detailsLoading ? (
						<>
							<DialogHeader>
								<DialogTitle className="sr-only">Loading Station Details</DialogTitle>
							</DialogHeader>
							<div className="flex h-64 items-center justify-center">
								<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
								<span className="ml-2">Loading details...</span>
							</div>
						</>
					) : selectedStation && stationDetails ? (
						<>
							<DialogHeader>
								<DialogTitle className="text-xl flex items-center">
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
									<h3 className="font-medium mb-2">Key Skills Required</h3>
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
									<h3 className="font-medium mb-2">Development Path</h3>
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
									<Button>
										Set as Career Goal
									</Button>
								</div>
							</div>
						</>
					) : (
						<>
							<DialogHeader>
								<DialogTitle>Station Information</DialogTitle>
							</DialogHeader>
							<div className="p-6 text-center">
								<p className="text-muted-foreground">Station information not available</p>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}