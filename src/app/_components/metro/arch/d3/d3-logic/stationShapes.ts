// src/app/_components/metro/d3-logic/stationShapes.ts
import type { EnhancedMetroStation, StationVisualStyle } from './types';

// Constants for styling
const INTERCHANGE_WIDTH_FACTOR = 1.2; // Width of interchange rect relative to lineWidth
const INTERCHANGE_HEIGHT_FACTOR = 3.0; // Height of interchange rect relative to lineWidth
const INTERCHANGE_RX_FACTOR = 0.5; // Corner radius relative to lineWidth
const SINGLE_STATION_RADIUS_FACTOR = 1.37; // Radius of circle markers

/**
 * Defines parameters for drawing a station marker based on its style.
 */
export interface StationMarkerParams {
	type: 'circle' | 'rect';
	// Circle specific
	radius?: number;
	// Rect specific
	width?: number;
	height?: number;
	rx?: number; // Corner radius
	ry?: number;
	// Common
	strokeWidth: number;
	// Transform origin offset (needed for rects)
	offsetX: number;
	offsetY: number;
}

/**
 * Calculates the parameters needed to draw a station marker.
 */
export function getStationMarkerParams(
	station: EnhancedMetroStation,
	lineWidth: number
): StationMarkerParams {
	const strokeWidth = lineWidth / 4;

	if (station.visualStyle === 'interchange') {
		const width = lineWidth * 2 * INTERCHANGE_WIDTH_FACTOR;
		const height = lineWidth * INTERCHANGE_HEIGHT_FACTOR;
		const rx = lineWidth * INTERCHANGE_RX_FACTOR;
		return {
			type: 'rect',
			width: width,
			height: height,
			rx: rx,
			ry: rx,
			strokeWidth: strokeWidth,
			offsetX: -width / 2, // Center the rect horizontally
			offsetY: -height / 2, // Center the rect vertically
		};
	} else {
		// Default to 'single' style circle
		const radius = lineWidth * SINGLE_STATION_RADIUS_FACTOR;
		return {
			type: 'circle',
			radius: radius,
			strokeWidth: strokeWidth,
			offsetX: 0, // Circle transform is centered by default
			offsetY: 0,
		};
	}
	// Add 'connector' style if needed (e.g., smaller dot or invisible)
}

/**
 * Generates the SVG 'd' attribute for a simple circular station marker.
 * (Alternative to using <circle> element, similar to U-Bahn example's trainStop)
 */
export function getCircleMarkerPath(radius: number): string {
	// Using arc command to draw a circle
	return d3.arc()
		.innerRadius(0)
		.outerRadius(radius)
		.startAngle(0)
		.endAngle(2 * Math.PI)();
}