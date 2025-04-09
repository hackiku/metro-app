// src/app/_components/metro/d3-logic/highlighter.ts
import * as d3 from 'd3';

// Constants for highlight styles
const HIGHLIGHT_STROKE_WIDTH_FACTOR = 2; // e.g., double the normal stroke width
const HIGHLIGHT_TEXT_DECORATION = 'underline';

/**
 * Utility function to generate a CSS class name from a station ID or name.
 * Handles potential special characters if IDs are not simple strings.
 */
export function getStationClass(stationId: string): string {
	// Basic sanitization: replace spaces, parentheses, etc. Add more rules if needed.
	const sanitizedId = stationId.replace(/[\s()]/g, '-');
	return `station-element-${sanitizedId}`;
}

/**
 * Applies or removes highlight styles to station elements (marker and label).
 * Assumes station markers and labels have a common class applied based on station ID.
 *
 * @param stationId The unique ID of the station.
 * @param isHighlighted True to apply highlight, false to remove.
 * @param baseLineWidth The normal line width used for scaling strokes.
 */
export function toggleStationHighlight(
	stationId: string,
	isHighlighted: boolean,
	baseLineWidth: number
): void {
	const stationClass = getStationClass(stationId);
	const elements = d3.selectAll(`.${stationClass}`); // Select both marker and label group/elements

	const normalStrokeWidth = baseLineWidth / 4; // Match stationShapes.ts
	const highlightedStrokeWidth = normalStrokeWidth * HIGHLIGHT_STROKE_WIDTH_FACTOR;

	elements.each(function () {
		const element = d3.select(this);

		// --- Marker Styling (assuming marker is rect or circle/path inside the group) ---
		const marker = element.select('rect, circle, path.station-marker'); // Adjust selector as needed
		if (!marker.empty()) {
			marker
				.attr('stroke-width', isHighlighted ? highlightedStrokeWidth : normalStrokeWidth);
			// Optional: Change fill/stroke colors on highlight
			// marker.attr('fill', isHighlighted ? 'yellow' : 'white');
		}


		// --- Label Styling (assuming label is a text element inside the group) ---
		const label = element.select('text.station-label'); // Adjust selector
		if (!label.empty()) {
			label
				.style('text-decoration', isHighlighted ? HIGHLIGHT_TEXT_DECORATION : 'none')
				.style('font-weight', isHighlighted ? 'bold' : 'normal'); // Example: make bold on hover
		}


		// --- Store highlight state (optional, might be better in React state) ---
		// element.attr('data-highlighted', isHighlighted ? 'true' : 'false');
	});
}

/**
 * Applies highlight styles to a specific line path.
 *
 * @param lineId The ID of the line (e.g., from EnhancedMetroLine.id).
 * @param isHighlighted True to apply highlight, false to remove.
 * @param baseLineWidth Normal line width.
 */
export function toggleLineHighlight(
	lineId: string,
	isHighlighted: boolean,
	baseLineWidth: number
): void {
	const lineElement = d3.select(`#line-path-${lineId}`); // Assumes line path has id="line-path-..."
	if (!lineElement.empty()) {
		const highlightWidth = baseLineWidth * 1.5; // Example: make line thicker
		lineElement
			.attr('stroke-width', isHighlighted ? highlightWidth : baseLineWidth)
			.style('opacity', isHighlighted ? 1 : 0.7); // Example: make non-highlighted lines dimmer
	}
}


/**
 * Highlights a path consisting of multiple connections/lines.
 * @param stationIds Sequence of station IDs in the path.
 * @param connectionIds Sequence of connection IDs representing the path segments.
 * @param baseLineWidth
 */
export function highlightRoute(
	stationIds: string[],
	connectionIds: string[], // Assuming you can identify connections
	baseLineWidth: number
): void {
	// 1. Dim all lines and stations initially
	d3.selectAll('.metro-line-path').style('opacity', 0.3).attr('stroke-width', baseLineWidth); // Add class to line paths
	d3.selectAll('.station-group').style('opacity', 0.5); // Add class to station groups

	// 2. Highlight stations in the path
	stationIds.forEach(id => {
		const stationClass = getStationClass(id);
		d3.selectAll(`.${stationClass}`).style('opacity', 1);
		// Apply visual emphasis (e.g., thicker stroke) using toggleStationHighlight logic if needed
		toggleStationHighlight(id, true, baseLineWidth);
	});

	// 3. Highlight connections/line segments in the path
	// This is the trickiest part. How do you map connectionIds to specific SVG path elements or segments?
	// Option A: If each connection is a separate <path> element:
	connectionIds.forEach(id => {
		d3.select(`#connection-path-${id}`) // Requires unique IDs on connection paths
			.style('opacity', 1)
			.attr('stroke-width', baseLineWidth * 1.5) // Make path thicker
			.raise(); // Bring to front
	});
	// Option B: If lines are single paths, you need a way to visually emphasize parts of them.
	// This might involve drawing a second, thicker path on top for the highlighted route segments.

	console.warn("Route connection highlighting is complex and depends on how segments are drawn.");
}

/**
 * Resets all highlights, bringing all elements back to normal state.
 * @param baseLineWidth
 */
export function resetHighlights(baseLineWidth: number): void {
	d3.selectAll('.metro-line-path').style('opacity', 1).attr('stroke-width', baseLineWidth);
	d3.selectAll('.station-group').style('opacity', 1);

	// Reset individual station highlights (assuming they store state or we query all)
	d3.selectAll('.station-group [data-highlighted="true"]').each(function () {
		// Logic to find station ID from element and call toggleStationHighlight(id, false, ...)
		// This part is complex without React state managing highlight status.
	});
	// Or simpler: just reset all styles directly
	d3.selectAll('.station-group rect, .station-group circle, .station-group path.station-marker')
		.attr('stroke-width', baseLineWidth / 4);
	d3.selectAll('.station-group text.station-label')
		.style('text-decoration', 'none')
		.style('font-weight', 'normal');

}