// src/app/_components/metro/d3-logic/labelUtils.ts
import * as d3 from 'd3';
import type { EnhancedMetroStation, LabelPosition } from './types';

const DEFAULT_LABEL_POSITION: LabelPosition = 'E';
const LABEL_OFFSET_FACTOR = 1.8; // Base offset distance from node center (relative to lineWidth)
const SQRT_2 = Math.sqrt(2);

interface LabelPosResult {
	x: number;
	y: number;
	textAnchor: 'start' | 'middle' | 'end';
	alignmentBaseline: 'auto' | 'hanging' | 'middle' | 'baseline'; // D3 uses dominant-baseline, SVG uses alignment-baseline
}

/**
 * Calculates the pixel offset and text anchor for a label based on its
 * relative position (N, NE, E, etc.) and the line width.
 * Mimics the logic from the U-Bahn example's textPos function.
 */
export function calculateLabelPosition(
	station: EnhancedMetroStation,
	lineWidth: number,
	numLinesInLabel: number = 1 // Needed for NW/N positioning
): LabelPosResult {
	const position = station.labelPos || DEFAULT_LABEL_POSITION;
	const offset = lineWidth * LABEL_OFFSET_FACTOR;
	let x = 0;
	let y = 0;
	let textAnchor: 'start' | 'middle' | 'end' = 'start';
	let alignmentBaseline: LabelPosResult['alignmentBaseline'] = 'baseline';

	// Calculate base offset based on position
	switch (position.toUpperCase()) {
		case 'N':
			// U-Bahn example adjusted y based on number of lines in label
			y = (lineWidth * (numLinesInLabel - 0.5) * 1.1) + offset; // Positive Y is typically down in SVG, but D3 scale might invert
			textAnchor = 'middle';
			alignmentBaseline = 'baseline'; // Text bottom aligns with point
			break;
		case 'NE':
			x = offset / SQRT_2;
			y = offset / SQRT_2;
			textAnchor = 'start';
			alignmentBaseline = 'baseline';
			break;
		case 'E':
			x = offset;
			// y = -2; // Small vertical adjustment in example
			alignmentBaseline = 'middle'; // Vertically centered
			break;
		case 'SE':
			x = offset / SQRT_2;
			y = -offset / SQRT_2;
			textAnchor = 'start';
			alignmentBaseline = 'hanging'; // Text top aligns with point
			break;
		case 'S':
			y = -offset;
			textAnchor = 'middle';
			alignmentBaseline = 'hanging';
			break;
		case 'SW':
			x = -offset / SQRT_2;
			y = -offset / SQRT_2;
			textAnchor = 'end';
			alignmentBaseline = 'hanging';
			break;
		case 'W':
			x = -offset;
			// y = -2; // Small vertical adjustment
			textAnchor = 'end';
			alignmentBaseline = 'middle';
			break;
		case 'NW':
			// U-Bahn example adjusted x and y based on number of lines
			x = -(lineWidth * (numLinesInLabel - 0.5) * 1.1 + offset) / SQRT_2;
			y = (lineWidth * (numLinesInLabel - 0.5) * 1.1 + offset) / SQRT_2;
			textAnchor = 'end';
			alignmentBaseline = 'baseline';
			break;
	}

	// Apply specific label shifts if provided (relative to grid, not pixels yet)
	// These shifts need scaling if they represent grid units, or direct use if pixels.
	// Assuming they are pixel offsets for simplicity now.
	// x += station.labelShiftX || 0;
	// y += station.labelShiftY || 0;
	// NB: The U-Bahn shifts were grid-based. This needs clarification. Let's ignore labelShift for now.

	// Adjust Y based on D3 scale direction (if y points up, negate y offsets)
	// This depends on how scales are set up in MetroMap.tsx. Assuming standard SVG (Y down).
	y = -y; // Invert y offset because SVG Y is down, but calcs assumed Y up

	return { x, y, textAnchor, alignmentBaseline };
}


/**
 * Wraps SVG text based on newline characters.
 * Adapted from the U-Bahn example's wrap function.
 * @param textSelection D3 selection of the <text> element(s).
 * @param initialBaseline Alignment baseline for the first line.
 */
export function wrapLabel(
	textSelection: d3.Selection<SVGTextElement, unknown, any, any>,
	initialBaseline: LabelPosResult['alignmentBaseline']
): void {
	textSelection.each(function () {
		const text = d3.select(this);
		const originalText = text.text(); // Get text content potentially set before calling wrap
		if (!originalText) return;

		const lines = originalText.split(/\n/);
		const x = text.attr('x');
		const y = text.attr('y');
		// Use 'dy' for line spacing relative to the previous line.
		// The first line's position is set by x, y. Subsequent lines use dy.
		const dy = 1.1; // Line height factor (adjust as needed)

		text.text(null); // Clear existing content

		lines.forEach((line, i) => {
			text.append('tspan')
				.attr('x', x)
				.attr('dy', i === 0 ? '0' : `${dy}em`) // Apply dy only for subsequent lines
				// .attr('y', y) // Y is only needed for the first line implicitly
				.attr('dominant-baseline', initialBaseline === 'auto' ? 'auto' : 'inherit') // Use dominant-baseline, inherit for tspans
				.text(line);
		});
	});
}