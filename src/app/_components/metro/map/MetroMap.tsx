// src/app/_components/metro/map/MetroMap.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { MetroLine } from "./MetroLine"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
	fetchMetroLines,
	fetchStationDetails,
	type MetroLine,
	type MetroStation,
	type StationDetail
} from "../services/metroDataService"

interface MetroMapProps {
	activeSkillCategory: string
	schema?: string
}

export function MetroMap({ activeSkillCategory, schema = 'gasunie' }: MetroMapProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(1)
	const [position, setPosition] = useState({ x: 50, y: 50 }) // Center position
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const [metroLines, setMetroLines] = useState<MetroLine[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null)
	const [stationDetails, setStationDetails] = useState<StationDetail | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [detailsLoading, setDetailsLoading] = useState(false)

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

				// Reset position and scale when changing categories
				setPosition({ x: 50, y: 50 })
				setScale(1)

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

	// Handle mouse wheel for zooming
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault()
			const delta = -Math.sign(e.deltaY) * 0.1
			setScale(prevScale => Math.max(0.5, Math.min(2, prevScale + delta)))
		}

		const container = containerRef.current
		if (container) {
			container.addEventListener('wheel', handleWheel, { passive: false })
		}

		return () => {
			if (container) {
				container.removeEventListener('wheel', handleWheel)
			}
		}
	}, [])

	// Mouse handlers for dragging
	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true)
		setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			})
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	return (
		<div
			ref={containerRef}
			className="h-full w-full cursor-grab overflow-hidden bg-neutral-100 dark:bg-neutral-800"
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			{/* Loading indicator */}
			{isLoading && (
				<div className="flex h-full w-full items-center justify-center">
					<div className="text-center">
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
						<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading metro map...</p>
					</div>
				</div>
			)}

			{/* No data message */}
			{!isLoading && metroLines.length === 0 && (
				<div className="flex h-full w-full items-center justify-center">
					<div className="text-center">
						<p className="text-lg font-semibold">No career paths found</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							No data available for the current view
						</p>
					</div>
				</div>
			)}

			{/* The SVG container for the metro map */}
			{!isLoading && metroLines.length > 0 && (
				<div
					className="h-full w-full"
					style={{
						transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
						transformOrigin: 'center',
						transition: isDragging ? 'none' : 'transform 0.1s ease-out'
					}}
				>
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 100 100"
						preserveAspectRatio="xMidYMid meet"
					>
						{/* Grid for visual reference */}
						<g className="grid">
							{[...Array(10)].map((_, i) => (
								<line
									key={`grid-h-${i}`}
									x1="0"
									y1={i * 10}
									x2="100"
									y2={i * 10}
									stroke="rgba(200, 200, 200, 0.2)"
									strokeWidth="0.2"
								/>
							))}
							{[...Array(10)].map((_, i) => (
								<line
									key={`grid-v-${i}`}
									x1={i * 10}
									y1="0"
									x2={i * 10}
									y2="100"
									stroke="rgba(200, 200, 200, 0.2)"
									strokeWidth="0.2"
								/>
							))}
						</g>

						{/* Render each metro line */}
						{metroLines.map(line => (
							<MetroLine
								key={line.id}
								line={line}
								onStationClick={handleStationSelect}
							/>
						))}
					</svg>
				</div>
			)}

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
											{stationDetails.skills.map((skill, index) => (
												<div key={index} className="flex items-center p-2 border rounded-md">
													<div className="mr-2">
														<div className="h-3 w-3 rounded-full"
															style={{
																backgroundColor:
																	skill.importance >= 4 ? 'red' :
																		skill.importance >= 3 ? 'orange' :
																			'green'
															}}
														/>
													</div>
													<div>{skill.name}</div>
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
									<Button>
										Set as Career Goal
									</Button>
								</div>
							</div>
						</>
					) : (
						<div className="p-6 text-center">
							<p>Station information not available</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}