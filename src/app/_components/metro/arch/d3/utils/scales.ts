// src/app/_components/metro/d3/utils/scales.ts
import * as d3 from "d3"
import type { MetroLine } from "../../types/metro"

// Create scales for metro map based on data
export function createMetroScales(lines: MetroLine[], width: number, height: number, padding = 40) {
	// Find the range of x and y coordinates
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
	minX -= padding
	minY -= padding
	maxX += padding
	maxY += padding

	// Create scales
	const xScale = d3.scaleLinear()
		.domain([minX, maxX])
		.range([0, width])

	const yScale = d3.scaleLinear()
		.domain([minY, maxY])
		.range([0, height])

	return { xScale, yScale }
}