// src/app/_components/metro/d3/MetroMap.tsx (updated)
"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { MetroLine, MetroStation } from "../types/metro"

interface MetroMapProps {
	lines: MetroLine[]
	isLoading?: boolean
	onStationSelect?: (station: MetroStation) => void
	selectedStation?: MetroStation | null
	stationDetails?: any
	width?: number
	height?: number
}

export function MetroMap({
	lines,
	isLoading = false,
	onStationSelect,
	selectedStation,
	stationDetails,
	width = 800,
	height = 600
}: MetroMapProps) {
	const svgRef = useRef<SVGSVGElement>(null)
	const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)

	// Setup D3 visualization
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

		// Calculate the spacing and scaling
		const xRange = maxX - minX || 1
		const yRange = maxY - minY || 1
		const scaleFactor = Math.min(width / xRange, height / yRange) * 0.8

		// Create scales for consistent spacing
		const xScale = d3.scaleLinear()
			.domain([minX, maxX])
			.range([width * 0.1, width * 0.9]) // Add padding of 10% on each side

		const yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([height * 0.1, height * 0.9]) // Add padding of 10% on each side

		// Draw metro lines
		lines.forEach(line => {
			const lineGroup = g.append("g")
				.attr("class", `line-${line.id}`)

			// Draw the line path if there are at least 2 stations
			if (line.stations.length >= 2) {
				// Line generator for curved paths
				const lineGenerator = d3.line<{ x: number, y: number }>()
					.x(d => xScale(d.x))
					.y(d => yScale(d.y))
					.curve(d3.curveMonotoneX)

				lineGroup.append("path")
					.attr("d", lineGenerator(line.stations))
					.attr("stroke", line.color)
					.attr("stroke-width", 6)
					.attr("fill", "none")
					.attr("stroke-linecap", "round")
			}

			// Create stations
			line.stations.forEach(station => {
				const stationGroup = lineGroup.append("g")
					.attr("class", "station")
					.attr("transform", `translate(${xScale(station.x)},${yScale(station.y)})`)
					.style("cursor", "pointer")
					.on("click", (event) => {
						event.stopPropagation(); // Prevent triggering zoom/pan
						if (onStationSelect) onStationSelect(station)
					})

				// Station circle
				stationGroup.append("circle")
					.attr("r", 8)
					.attr("fill", "var(--background)")
					.attr("stroke", line.color)
					.attr("stroke-width", 3)
					.attr("class", "station-circle")

				// Station name
				stationGroup.append("text")
					.attr("x", 0)
					.attr("y", -15)
					.attr("text-anchor", "middle")
					.attr("class", "fill-foreground text-sm font-medium")
					.text(station.name)

				// Station level
				stationGroup.append("text")
					.attr("x", 0)
					.attr("y", 20)
					.attr("text-anchor", "middle")
					.attr("class", "fill-muted-foreground text-xs")
					.text(`Level ${station.level}`)

				// Highlight selected station
				if (selectedStation && selectedStation.id === station.id) {
					stationGroup.select("circle")
						.attr("r", 10)
						.attr("stroke-width", 4)
				}
			})
		})
	}, [lines, selectedStation, onStationSelect, width, height, transform])

	// Setup zoom behavior
	useEffect(() => {
		if (!svgRef.current) return

		const svg = d3.select(svgRef.current)
		const g = svg.select(".zoom-container")

		// Create zoom behavior
		const zoom = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5]) // Min and max zoom levels
			.on("zoom", (event) => {
				// Update the transform state
				setTransform(event.transform)

				// Apply transform to the container
				g.attr("transform", event.transform.toString())
			})

		// Initialize zoom and enable wheel/drag
		svg.call(zoom)
			.on("dblclick.zoom", null) // Disable double-click zoom

		// Reset zoom on component changes
		return () => {
			svg.on(".zoom", null)
		}
	}, [])

	// Loading state
	if (isLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading metro map...</p>
				</div>
			</div>
		)
	}

	// Empty state
	if (lines.length === 0) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<div className="text-center">
					<p className="font-semibold text-foreground">No career paths found</p>
					<p className="text-muted-foreground">No data available for the current view</p>
				</div>
			</div>
		)
	}

	return (
		<div className="relative w-full h-full">
			<svg
				ref={svgRef}
				width="100%"
				height="100%"
				className="w-full h-full bg-background"
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="xMidYMid meet"
			>
				{/* Container for zoomable content */}
				<g className="zoom-container" />
			</svg>
		</div>
	)
}