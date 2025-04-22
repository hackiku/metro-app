// src/app/_components/metro/d3/layoutEngine.ts

import * as d3 from 'd3';
import type { MetroLine, MetroNode, MetroConnection, LayoutConfig } from '~/types/metro';

// Default configuration
const DEFAULT_CONFIG: LayoutConfig = {
	levelSpacing: 150,     // Horizontal spacing between levels
	pathSpacing: 140,      // Vertical spacing between paths
	interchangeRadius: 20, // Extra spacing around interchange nodes
	junctionOffset: 30,    // Offset for junctions between paths
	padding: 100           // Padding around the whole visualization
};

/**
 * Calculate optimal positions for metro lines and nodes
 */
export function calculateLayout(
	lines: MetroLine[],
	connections: MetroConnection[],
	config: Partial<LayoutConfig> = {}
): MetroLine[] {
	// Merge with default config
	const layoutConfig = { ...DEFAULT_CONFIG, ...config };

	// Step 1: Position nodes horizontally based on level
	const linesWithHorizontalPositions = positionNodesHorizontally(lines, layoutConfig);

	// Step 2: Position lines vertically with equal spacing
	const linesWithInitialPositions = positionLinesVertically(linesWithHorizontalPositions, layoutConfig);

	// Step 3: Identify interchange nodes
	const interchangeNodeIds = findInterchangeNodes(lines);

	// Step 4: Adjust positions for interchanges
	const linesWithAdjustedPositions = adjustInterchangePositions(
		linesWithInitialPositions,
		interchangeNodeIds,
		layoutConfig
	);

	// Step 5: Optimize for minimal edge crossings
	return optimizeEdgeCrossings(linesWithAdjustedPositions, connections, layoutConfig);
}

// Position nodes horizontally based on their level
function positionNodesHorizontally(lines: MetroLine[], config: LayoutConfig): MetroLine[] {
	return lines.map(line => ({
		...line,
		nodes: line.nodes.map(node => ({
			...node,
			x: node.level * config.levelSpacing + config.padding
		}))
	}));
}

// Position lines vertically with equal spacing
function positionLinesVertically(lines: MetroLine[], config: LayoutConfig): MetroLine[] {
	return lines.map((line, index) => {
		const yPosition = config.padding + (index * config.pathSpacing);

		return {
			...line,
			nodes: line.nodes.map(node => ({
				...node,
				y: yPosition
			}))
		};
	});
}

// Find nodes that appear in multiple lines
function findInterchangeNodes(lines: MetroLine[]): Set<string> {
	const nodeOccurrences = new Map<string, number>();
	const interchangeNodes = new Set<string>();

	// Count occurrences of each node ID
	lines.forEach(line => {
		line.nodes.forEach(node => {
			const count = (nodeOccurrences.get(node.id) || 0) + 1;
			nodeOccurrences.set(node.id, count);

			if (count > 1) {
				interchangeNodes.add(node.id);
			}
		});
	});

	return interchangeNodes;
}

// Adjust positions for interchange nodes
function adjustInterchangePositions(
	lines: MetroLine[],
	interchangeNodes: Set<string>,
	config: LayoutConfig
): MetroLine[] {
	// If there are no interchange nodes, return original
	if (interchangeNodes.size === 0) return lines;

	// For each interchange node, find all its occurrences and adjust positions
	interchangeNodes.forEach(nodeId => {
		// Find all occurrences of this node
		const occurrences: { lineIndex: number, nodeIndex: number, node: MetroNode }[] = [];

		lines.forEach((line, lineIndex) => {
			line.nodes.forEach((node, nodeIndex) => {
				if (node.id === nodeId) {
					occurrences.push({ lineIndex, nodeIndex, node });
				}
			});
		});

		// Calculate the average y-position
		const avgY = occurrences.reduce((sum, item) => sum + item.node.y, 0) / occurrences.length;

		// Update all occurrences to the average y-position
		occurrences.forEach(({ lineIndex, nodeIndex }) => {
			lines[lineIndex].nodes[nodeIndex].y = avgY;
			lines[lineIndex].nodes[nodeIndex].isInterchange = true;
		});
	});

	return lines;
}

// Optimize for minimal edge crossings (simplified version)
function optimizeEdgeCrossings(
	lines: MetroLine[],
	connections: MetroConnection[],
	config: LayoutConfig
): MetroLine[] {
	// For simplicity, we'll just make a small adjustment to lines 
	// with interchanges to avoid total overlap

	// Find lines with interchanges
	const linesWithInterchanges = new Set<number>();

	lines.forEach((line, index) => {
		if (line.nodes.some(node => node.isInterchange)) {
			linesWithInterchanges.add(index);
		}
	});

	// Apply a small vertical jitter to lines with interchanges
	return lines.map((line, index) => {
		if (linesWithInterchanges.has(index)) {
			// Apply a small vertical offset proportional to the index
			const jitterOffset = (index % 3) * config.junctionOffset;

			return {
				...line,
				nodes: line.nodes.map(node => {
					// Only jitter non-interchange nodes
					if (!node.isInterchange) {
						return {
							...node,
							y: node.y + jitterOffset
						};
					}
					return node;
				})
			};
		}
		return line;
	});
}