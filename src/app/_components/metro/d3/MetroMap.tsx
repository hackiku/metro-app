// src/app/_components/metro/d3/MetroMap.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { MetroLine, MetroStation } from "../types/metro"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog"

interface MetroMapProps {
	lines: MetroLine[]
	isLoading?: boolean
	onStationSelect?: (station: MetroStation) => void
	selectedStation?: MetroStation | null
	stationDetails?: any // Replace with proper type
	width?: number
	height?: number
}

export function D3MetroMap({
	lines,
	isLoading = false,
	onStationSelect,
	selectedStation,
	stationDetails,
	width = 800,
	height = 600
}: MetroMapProps) {
	const svgRef = useRef<SVGSVGElement>(null)
	const [zoom, setZoom] = useState({ k: 1, x: 0, y: 0 })

	// Setup zoom behavior
	useEffect(() => {
		if (!svgRef.current) return

		const svg = d3.select(svgRef.current)

		const zoomBehavior = d3.zoom()
			.scaleExtent([0.5, 5])
			.on("zoom", (event) => {
				setZoom(event.transform)
			})

		svg.call(zoomBehavior as any)

		// Reset zoom when lines change
		zoomBehavior.transform(svg as any, d3.zoomIdentity)

		return () => {
			svg.on(".zoom", null)
		}
	}, [lines])

	// Render the metro map with D3
	useEffect(() => {
		if (!svgRef.current || lines.length === 0) return

		const svg = d3.select(svgRef.current)
		const g = svg.select(".zoom-container")

		// Clear previous elements
		g.selectAll("*").remove()

		// Determine map dimensions for auto-scaling
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

		lines.forEach(line => {
			line.stations.forEach(station => {
				minX = Math.min(minX, station.x)
				minY = Math.min(minY, station.y)
				maxX = Math.max(maxX, station.x)
				maxY = Math.max(maxY, station.y)
			})
		})

		// Add padding
		minX -= 10
		minY -= 10
		maxX += 10
		maxY += 10

		// Create a group for each line
		lines.forEach(line => {
			const lineGroup = g.append("g")
				.attr("class", `line-${line.id}`)

			// Draw the line path
			if (line.stations.length >= 2) {
				// Line generator for curved paths
				const lineGenerator = d3.line<MetroStation>()
					.x(d => d.x)
					.y(d => d.y)
					.curve(d3.curveMonotoneX)

				lineGroup.append("path")
					.attr("d", lineGenerator(line.stations))
					.attr("stroke", line.color)
					.attr("stroke-width", 6)
					.attr("fill", "none")
					.attr("stroke-linecap", "round")
			}

			// Create a group for each station
			line.stations.forEach(station => {
				const stationGroup = lineGroup.append("g")
					.attr("class", "station")
					.attr("transform", `translate(${station.x},${station.y})`)
					.style("cursor", "pointer")
					.on("click", () => {
						if (onStationSelect) onStationSelect(station)
					})

				// Station circle
				stationGroup.append("circle")
					.attr("r", 12)
					.attr("fill", "white")
					.attr("stroke", line.color)
					.attr("stroke-width", 3)
					.attr("class", "station-circle")

				// Station name
				stationGroup.append("text")
					.attr("y", -20)
					.attr("text-anchor", "middle")
					.attr("class", "text-foreground text-sm")
					.text(station.name)

				// Station level
				stationGroup.append("text")
					.attr("y", 25)
					.attr("text-anchor", "middle")
					.attr("class", "text-xs text-muted-foreground")
					.text(`Level ${station.level}`)

				// Highlight selected station
				if (selectedStation && selectedStation.id === station.id) {
					stationGroup.select("circle")
						.attr("r", 15)
						.attr("stroke-width", 4)
				}
			})
		})
	}, [lines, selectedStation, onStationSelect])

	if (isLoading) {
		return (
			<Card className="w-full h-full flex items-center justify-center">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading metro map...</p>
				</div>
			</Card>
		)
	}

	if (lines.length === 0) {
		return (
			<Card className="w-full h-full flex items-center justify-center">
				<div className="text-center">
					<p className="font-semibold text-foreground">No career paths found</p>
					<p className="text-muted-foreground">No data available for the current view</p>
				</div>
			</Card>
		)
	}

	return (
		<div className="relative w-full h-full">
			<svg
				ref={svgRef}
				width={width}
				height={height}
				className="w-full h-full bg-background"
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="xMidYMid meet"
			>
				{/* Transform group for zoom */}
				<g
					className="zoom-container"
					transform={`translate(${zoom.x},${zoom.y}) scale(${zoom.k})`}
				/>
			</svg>
		</div>
	)
}