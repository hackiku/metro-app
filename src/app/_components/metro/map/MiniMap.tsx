// src/app/_components/metro/map/MiniMap.tsx
"use client"

import { useEffect, useState } from "react"
import { supabase } from "~/server/db/supabase"

interface MiniMapProps {
	schema?: string
	onSectionSelect?: (x: number, y: number) => void
}

export function MiniMap({ schema = 'gasunie', onSectionSelect }: MiniMapProps) {
	const [lines, setLines] = useState<Array<{ id: string, color: string, points: Array<{ x: number, y: number }> }>>([])
	const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 })
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchMapOverview() {
			try {
				setIsLoading(true)

				// Fetch all metro lines
				const { data: linesData, error: linesError } = await supabase
					.from(`${schema}.metro_lines`)
					.select('id, color')

				if (linesError) throw linesError

				if (!linesData || linesData.length === 0) {
					setLines([])
					return
				}

				// For each line, get station positions
				const linesWithPoints = await Promise.all(
					linesData.map(async (line) => {
						const { data: stationsData } = await supabase
							.from(`${schema}.metro_stations`)
							.select('position_x, position_y')
							.eq('metro_line_id', line.id)
							.order('position_x', { ascending: true })

						return {
							id: line.id,
							color: line.color,
							points: (stationsData || []).map(station => ({
								x: station.position_x,
								y: station.position_y
							}))
						}
					})
				)

				setLines(linesWithPoints)

				// Calculate overall bounds
				let minX = 0, minY = 0, maxX = 100, maxY = 100
				linesWithPoints.forEach(line => {
					line.points.forEach(point => {
						minX = Math.min(minX, point.x)
						minY = Math.min(minY, point.y)
						maxX = Math.max(maxX, point.x)
						maxY = Math.max(maxY, point.y)
					})
				})

				// Set view with some padding
				setViewBox({
					x: minX - 5,
					y: minY - 5,
					width: maxX - minX + 10,
					height: maxY - minY + 10
				})

			} catch (error) {
				console.error('Error fetching mini map data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchMapOverview()
	}, [schema])

	const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
		if (!onSectionSelect) return

		// Get click coordinates relative to SVG
		const svg = e.currentTarget
		const point = svg.createSVGPoint()
		point.x = e.clientX
		point.y = e.clientY
		const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse())

		onSectionSelect(transformedPoint.x, transformedPoint.y)
	}

	if (isLoading) {
		return (
			<div className="h-24 w-24 bg-neutral-800 rounded-md flex items-center justify-center">
				<div className="h-4 w-4 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
			</div>
		)
	}

	return (
		<div className="h-24 w-24 bg-neutral-800/80 backdrop-blur-sm rounded-md p-1 border border-neutral-700">
			<svg
				width="100%"
				height="100%"
				viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
				preserveAspectRatio="xMidYMid meet"
				onClick={handleClick}
				className="cursor-pointer"
			>
				{/* Render simplified line paths */}
				{lines.map(line => (
					<path
						key={line.id}
						d={line.points.length >= 2
							? `M ${line.points[0].x} ${line.points[0].y} ${line.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`
							: ''}
						stroke={line.color}
						strokeWidth="0.5"
						fill="none"
					/>
				))}

				{/* Render current view area (placeholder) */}
				<rect
					x="30"
					y="30"
					width="40"
					height="40"
					fill="none"
					stroke="white"
					strokeWidth="0.5"
					strokeDasharray="1,1"
				/>
			</svg>
		</div>
	)
}