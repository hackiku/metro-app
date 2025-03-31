// src/app/_components/metro/map/MetroMap.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { MetroLine } from "./MetroLine"
import { supabase } from "~/server/db/supabase"

interface Station {
	id: string
	name: string
	level: number
	x: number
	y: number
}

interface SkillLine {
	id: string
	name: string
	color: string
	stations: Station[]
}

interface MetroMapProps {
	activeSkillCategory: string
}

export function MetroMap({ activeSkillCategory }: MetroMapProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(1)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const [skillLines, setSkillLines] = useState<SkillLine[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Fetch skill lines and stations from Supabase
	useEffect(() => {
		async function fetchSkillData() {
			try {
				setIsLoading(true)
				console.log('Fetching skill lines for category:', activeSkillCategory)

				// Fetch skill lines for the active category
				const { data: linesData, error: linesError } = await supabase
					.from('skill_lines')
					.select('*')
					.eq('category', activeSkillCategory)

				console.log('Lines data:', linesData)

				if (linesError) {
					throw linesError
				}

				if (!linesData || linesData.length === 0) {
					console.log('No skill lines found for category:', activeSkillCategory)
					setSkillLines([])
					setIsLoading(false)
					return
				}

				// For each line, fetch its stations
				const linesWithStations = await Promise.all(
					linesData.map(async (line) => {
						console.log('Fetching stations for line:', line.id)

						const { data: stationsData, error: stationsError } = await supabase
							.from('skill_stations')
							.select('*')
							.eq('line_id', line.id)
							.order('level', { ascending: true })

						console.log('Stations data for line', line.id, ':', stationsData)

						if (stationsError) {
							throw stationsError
						}

						// Convert to expected format
						const stations = stationsData ? stationsData.map(station => ({
							id: station.station_id,
							name: station.name,
							level: station.level,
							x: station.x_position,
							y: station.y_position
						})) : []

						return {
							id: line.line_id,
							name: line.name,
							color: line.color,
							stations
						}
					})
				)

				console.log('Final lines with stations:', linesWithStations)
				setSkillLines(linesWithStations)
			} catch (error) {
				console.error('Error fetching skill data:', error)
				if (error instanceof Error) {
					console.error('Error message:', error.message)
				}
				// Fallback to empty array if there's an error
				setSkillLines([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchSkillData()
	}, [activeSkillCategory])

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
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
						<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading skill map...</p>
					</div>
				</div>
			)}

			{/* No data message */}
			{!isLoading && skillLines.length === 0 && (
				<div className="flex h-full w-full items-center justify-center">
					<div className="text-center">
						<p className="text-lg font-semibold">No skill data found</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							No skills are available for the {activeSkillCategory} category
						</p>
					</div>
				</div>
			)}

			{/* The SVG container for the metro map */}
			{!isLoading && skillLines.length > 0 && (
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
						{skillLines.map(line => (
							<MetroLine key={line.id} line={line} />
						))}
					</svg>
				</div>
			)}
		</div>
	)
}