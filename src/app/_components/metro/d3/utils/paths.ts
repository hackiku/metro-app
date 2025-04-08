// src/app/_components/metro/d3/utils/paths.ts
import * as d3 from "d3"
import { MetroStation } from "../../types/metro"

// Generate smooth curve path for a line
export function generateLinePath(stations: MetroStation[]) {
	if (stations.length < 2) return ""

	const lineGenerator = d3.line<MetroStation>()
		.x(d => d.x)
		.y(d => d.y)
		.curve(d3.curveMonotoneX) // Smooth curve

	return lineGenerator(stations) || ""
}

// Generate straight line segments
export function generateStraightLinePath(stations: MetroStation[]) {
	if (stations.length < 2) return ""

	const lineGenerator = d3.line<MetroStation>()
		.x(d => d.x)
		.y(d => d.y)

	return lineGenerator(stations) || ""
}