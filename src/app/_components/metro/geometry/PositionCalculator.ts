// src/app/_components/metro/geometry/PositionCalculator.ts
import type { MetroNode, MetroPath, LayoutConfig, Point } from './types';

export class PositionCalculator {
	private config: LayoutConfig;

	constructor(config: LayoutConfig) {
		this.config = config;
	}

	// Calculate initial positions for all nodes in a set of paths
	calculatePositions(paths: MetroPath[]): MetroPath[] {
		// Create a deep copy to avoid modifying the original data
		const processedPaths = JSON.parse(JSON.stringify(paths)) as MetroPath[];

		// First pass: Position based on level and path index
		processedPaths.forEach((path, pathIndex) => {
			const baseY = this.config.padding + (pathIndex * this.config.pathSpacing);

			path.nodes.forEach(node => {
				// Basic positioning
				node.position = {
					x: this.config.padding + (node.level * this.config.levelSpacing),
					y: baseY
				};
			});
		});

		// Second pass: Adjust for interchanges (nodes in multiple paths)
		const nodeMap = new Map<string, { node: MetroNode, pathIndices: number[] }>();

		// Build a map of all nodes and their occurrences in paths
		processedPaths.forEach((path, pathIndex) => {
			path.nodes.forEach(node => {
				if (!nodeMap.has(node.id)) {
					nodeMap.set(node.id, { node, pathIndices: [pathIndex] });
				} else {
					nodeMap.get(node.id)?.pathIndices.push(pathIndex);
				}
			});
		});

		// Adjust positions for nodes in multiple paths
		nodeMap.forEach(({ node, pathIndices }) => {
			if (pathIndices.length > 1) {
				// Mark as interchange
				node.isInterchange = true;

				// Calculate average Y position between involved paths
				const avgPathIndex = pathIndices.reduce((sum, idx) => sum + idx, 0) / pathIndices.length;
				const targetY = this.config.padding + (avgPathIndex * this.config.pathSpacing);

				// Update all instances of this node
				pathIndices.forEach(pathIndex => {
					const path = processedPaths[pathIndex];
					const pathNode = path.nodes.find(n => n.id === node.id);
					if (pathNode) {
						pathNode.position.y = targetY;
					}
				});
			}
		});

		// Align nodes at the same level (optional)
		this.alignNodesByLevel(processedPaths);

		return processedPaths;
	}

	// Align nodes that are at the same level horizontally (for cleaner visualization)
	private alignNodesByLevel(paths: MetroPath[]): void {
		// Group nodes by level
		const nodesByLevel = new Map<number, { node: MetroNode, pathIndex: number }[]>();

		paths.forEach((path, pathIndex) => {
			path.nodes.forEach(node => {
				if (!nodesByLevel.has(node.level)) {
					nodesByLevel.set(node.level, []);
				}
				nodesByLevel.get(node.level)?.push({ node, pathIndex });
			});
		});

		// Ensure all nodes at the same level have the same x position
		nodesByLevel.forEach(nodesAtLevel => {
			// Calculate average x position
			const avgX = nodesAtLevel.reduce((sum, { node }) => sum + node.position.x, 0) / nodesAtLevel.length;

			// Assign the same x position to all nodes at this level
			nodesAtLevel.forEach(({ node }) => {
				node.position.x = avgX;
			});
		});
	}

	// Optimize layout to reduce crossing lines
	optimizeLayout(paths: MetroPath[]): MetroPath[] {
		// This would be a more complex algorithm - for now just return the input
		// In a real implementation, this could use various optimization strategies
		return paths;
	}

	// Find optimal position for a new node
	findOptimalPosition(level: number, pathIndices: number[]): Point {
		if (pathIndices.length === 0) {
			return this.calculateBasePosition(level, 0);
		}

		if (pathIndices.length === 1) {
			return this.calculateBasePosition(level, pathIndices[0]);
		}

		// For multiple paths, find the average position
		const avgPathIndex = pathIndices.reduce((sum, idx) => sum + idx, 0) / pathIndices.length;
		return this.calculateBasePosition(level, avgPathIndex);
	}

	// Calculate base position for a node
	private calculateBasePosition(level: number, pathIndex: number): Point {
		return {
			x: this.config.padding + (level * this.config.levelSpacing),
			y: this.config.padding + (pathIndex * this.config.pathSpacing)
		};
	}
}