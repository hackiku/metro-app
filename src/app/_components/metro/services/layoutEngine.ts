// src/app/_components/metro/services/layoutEngine.ts
import type { MetroData, Line, Station, Interchange } from './dataService';

// Configuration options for layout engine
export interface LayoutConfig {
	// Spacing between lines (vertically)
	lineSpacing: number;

	// Spacing between levels (horizontally)
	levelSpacing: number;

	// Base padding from edges
	padding: number;

	// Whether to auto-adjust interchanges
	adjustInterchanges: boolean;

	// Station sizing 
	stationRadius: number;

	// Line thickness
	lineWidth: number;
}

// Default configuration
const DEFAULT_CONFIG: LayoutConfig = {
	lineSpacing: 100,
	levelSpacing: 150,
	padding: 50,
	adjustInterchanges: true,
	stationRadius: 12,
	lineWidth: 8
};

/**
 * Primary function to calculate station positions for the metro map
 */
export function calculateLayout(data: MetroData, config: Partial<LayoutConfig> = {}): MetroData {
	// Merge provided config with defaults
	const layoutConfig: LayoutConfig = {
		...DEFAULT_CONFIG,
		...config
	};

	// Create a deep copy of data to avoid modifying the original
	const processedData = JSON.parse(JSON.stringify(data)) as MetroData;

	// Step 1: Position stations along their respective lines
	positionStationsOnLines(processedData, layoutConfig);

	// Step 2: Adjust interchange positions
	if (layoutConfig.adjustInterchanges) {
		adjustInterchangePositions(processedData, layoutConfig);
	}

	// Step 3: Add any path bends needed
	// addPathBends(processedData, layoutConfig);

	return processedData;
}

/**
 * Position stations along their respective lines
 */
function positionStationsOnLines(data: MetroData, config: LayoutConfig): void {
	const { lineSpacing, levelSpacing, padding } = config;

	// Position each line's stations
	data.lines.forEach((line, lineIndex) => {
		// Calculate the base y-position for this line
		const baseY = padding + (lineIndex * lineSpacing);

		// Sort stations by level (ensures proper ordering)
		line.stations.sort((a, b) => a.level - b.level);

		// Position each station on this line
		line.stations.forEach(station => {
			// Base position is determined by the station's level
			station.x = padding + (station.level * levelSpacing);
			station.y = baseY;

			// Note: Interchanges will be adjusted in the next step
		});
	});
}

/**
 * Adjust the positions of interchange stations
 */
function adjustInterchangePositions(data: MetroData, config: LayoutConfig): void {
	const { lineSpacing } = config;

	// Process each interchange
	data.interchanges.forEach(interchange => {
		// Get all lines this station is part of
		const { stationId, lineIds } = interchange;

		// Skip if there's only one line (not a true interchange)
		if (lineIds.length <= 1) return;

		// Find the line indices for each involved line
		const lineIndices = lineIds.map(lineId =>
			data.lines.findIndex(line => line.id === lineId)
		).filter(idx => idx !== -1);

		// Skip if not enough lines found
		if (lineIndices.length <= 1) return;

		// Calculate the average y-position
		const avgLineIndex = lineIndices.reduce((sum, idx) => sum + idx, 0) / lineIndices.length;
		const targetY = config.padding + (avgLineIndex * lineSpacing);

		// Find this station in each line and adjust its y-position
		lineIds.forEach(lineId => {
			const line = data.lines.find(l => l.id === lineId);
			if (!line) return;

			const station = line.stations.find(s => s.id === stationId);
			if (station) {
				station.y = targetY;

				// Move adjacent stations to create smoother bends
				// (This is simplified; a more sophisticated approach would create proper curves)
				smoothAdjacentStations(line.stations, station, config);
			}
		});
	});
}

/**
 * Smooth the positions of stations adjacent to interchanges
 */
function smoothAdjacentStations(stations: Station[], interchangeStation: Station, config: LayoutConfig): void {
	// Get the index of the interchange station
	const stationIndex = stations.findIndex(s => s.id === interchangeStation.id);
	if (stationIndex === -1) return;

	// We'll adjust stations within 2 positions of the interchange
	const adjustmentRadius = 2;
	const maxAdjustmentFactor = 0.6; // How much of the y-diff to apply to adjacent stations

	// Original line y-position (base position for this line)
	const nonInterchangeStations = stations.filter(s => s && !s.isInterchange);
	if (nonInterchangeStations.length === 0) return; // Exit if no non-interchange stations

	const baseLineY = nonInterchangeStations
		.reduce((sum, s) => sum + s.y, 0) / nonInterchangeStations.length;

	// The y-difference we're dealing with
	const yDiff = interchangeStation.y - baseLineY;

	// Apply gradually decreasing adjustments to nearby stations
	for (let i = 1; i <= adjustmentRadius; i++) {
		// Previous stations (to the left)
		if (stationIndex - i >= 0) {
			const station = stations[stationIndex - i];
			// Only adjust if not an interchange itself
			if (station && !station.isInterchange) {
				const adjustmentFactor = maxAdjustmentFactor * (1 - (i / (adjustmentRadius + 1)));
				station.y = baseLineY + (yDiff * adjustmentFactor);
			}
		}

		// Next stations (to the right)
		if (stationIndex + i < stations.length) {
			const station = stations[stationIndex + i];
			// Only adjust if not an interchange itself
			if (station && !station.isInterchange) {
				const adjustmentFactor = maxAdjustmentFactor * (1 - (i / (adjustmentRadius + 1)));
				station.y = baseLineY + (yDiff * adjustmentFactor);
			}
		}
	}
}

/**
 * Calculate connection paths between stations
 * This is a simplified version that just returns the IDs of stations in the path
 */
export function calculatePath(
	data: MetroData,
	fromStationId: string,
	toStationId: string
): string[] {
	// Simple implementation - just return the direct path
	// In a real implementation, you'd use a pathfinding algorithm (e.g., A*)
	return [fromStationId, toStationId];
}

/**
 * Generate SVG path string for a metro line
 */
export function generateLinePath(
	stations: Station[],
	config: LayoutConfig = DEFAULT_CONFIG
): string {
	if (!stations || stations.length < 2) return '';

	// Check the first station exists and has coordinates
	if (!stations[0] || stations[0].x === undefined || stations[0].y === undefined) {
		return '';
	}

	let pathData = `M ${stations[0].x},${stations[0].y}`;

	// For each station after the first
	for (let i = 1; i < stations.length; i++) {
		const prev = stations[i - 1];
		const curr = stations[i];

		// Skip if either station is undefined or missing coordinates
		if (!prev || !curr ||
			prev.x === undefined || prev.y === undefined ||
			curr.x === undefined || curr.y === undefined) {
			continue;
		}

		// If stations are not adjacent levels, we should create a curved path
		if (Math.abs(curr.level - prev.level) > 1 || Math.abs(curr.y - prev.y) > config.lineSpacing / 2) {
			// Create a bezier curve
			const controlPoint1X = prev.x;
			const controlPoint1Y = curr.y;

			pathData += ` C ${controlPoint1X},${controlPoint1Y} ${controlPoint1X},${controlPoint1Y} ${curr.x},${curr.y}`;
		} else {
			// Simple line segment for adjacent stations
			pathData += ` L ${curr.x},${curr.y}`;
		}
	}

	return pathData;
}

/**
 * Generate an SVG path for a connection between two stations
 */
export function generateConnectionPath(
	fromStation: Station,
	toStation: Station,
	config: LayoutConfig = DEFAULT_CONFIG
): string {
	// Simple straight line for now
	return `M ${fromStation.x},${fromStation.y} L ${toStation.x},${toStation.y}`;
}