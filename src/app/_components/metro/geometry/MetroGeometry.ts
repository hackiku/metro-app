// src/app/_components/metro/geometry/MetroGeometry.ts
import type { MetroNode, MetroPath, MetroConnection, LayoutConfig, Point } from './types';
import { CoordinateSystem } from './CoordinateSystem';
import { PathGenerator } from './PathGenerator';
import { PositionCalculator } from './PositionCalculator';
import { CollisionDetector } from './CollisionDetector';

// Main geometry engine that coordinates all geometry operations
export class MetroGeometry {
	private coordinateSystem: CoordinateSystem;
	private positionCalculator: PositionCalculator;
	private collisionDetector: CollisionDetector;
	private config: LayoutConfig;

	constructor(config?: Partial<LayoutConfig>) {
		this.config = {
			levelSpacing: 150,
			pathSpacing: 100,
			interchangeRadius: 14,
			junctionOffset: 25,
			padding: 50,
			...config
		};

		this.coordinateSystem = new CoordinateSystem(this.config);
		this.positionCalculator = new PositionCalculator(this.config);
		this.collisionDetector = new CollisionDetector(this.config);
	}

	// Calculate layout for all paths
	calculateLayout(paths: MetroPath[]): {
		paths: MetroPath[];
		viewBox: string;
	} {
		// Calculate positions
		const positionedPaths = this.positionCalculator.calculatePositions(paths);

		// Flatten all nodes for collision detection
		const allNodes = positionedPaths.flatMap(p => p.nodes);

		// Resolve collisions
		this.collisionDetector.resolveCollisions(allNodes);

		// Update view boundaries
		this.coordinateSystem.calculateBoundaries(allNodes);

		return {
			paths: positionedPaths,
			viewBox: this.coordinateSystem.getViewBox()
		};
	}

	// Generate a path for a metro line
	generatePathData(nodes: MetroNode[], metroStyle: boolean = true): string {
		return metroStyle
			? PathGenerator.metroPath(nodes)
			: PathGenerator.straightPath(nodes);
	}

	// Generate a connection between two nodes
	generateConnectionPath(fromNode: MetroNode, toNode: MetroNode): string {
		return PathGenerator.curvedConnection(fromNode.position, toNode.position);
	}

	// Find a node by id across all paths
	findNodeById(id: string, paths: MetroPath[]): { node: MetroNode, path: MetroPath } | undefined {
		for (const path of paths) {
			const node = path.nodes.find(n => n.id === id);
			if (node) {
				return { node, path };
			}
		}
		return undefined;
	}

	// Check if a node is an interchange (appears in multiple paths)
	isInterchangeNode(id: string, paths: MetroPath[]): boolean {
		const pathCount = paths.filter(path =>
			path.nodes.some(node => node.id === id)
		).length;

		return pathCount > 1;
	}

	// Get the current view boundaries
	getViewBoundaries(): { minX: number; minY: number; maxX: number; maxY: number } {
		return this.coordinateSystem.getViewBox()
			.split(' ')
			.map(Number)
			.reduce((obj, val, i) => {
				if (i === 0) obj.minX = val;
				else if (i === 1) obj.minY = val;
				else if (i === 2) obj.maxX = obj.minX + val;
				else if (i === 3) obj.maxY = obj.minY + val;
				return obj;
			}, { minX: 0, minY: 0, maxX: 0, maxY: 0 });
	}

	// Convert career data to metro visualization data
	convertCareerDataToMetro(careerPaths: any[], roles: any[], transitions: any[]): {
		paths: MetroPath[];
		connections: MetroConnection[];
	} {
		// Implementation would depend on your actual data structure
		// This is a placeholder for the transformation logic
		const metroPaths: MetroPath[] = [];
		const metroConnections: MetroConnection[] = [];

		// TODO: Implement transformation logic

		return { paths: metroPaths, connections: metroConnections };
	}
}