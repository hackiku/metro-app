// src/app/_components/metro/geometry/CollisionDetector.ts
import type { Point, MetroNode, LayoutConfig } from './types';

export class CollisionDetector {
	private config: LayoutConfig;

	constructor(config: LayoutConfig) {
		this.config = config;
	}

	// Check if two nodes are too close to each other
	detectNodeCollision(node1: MetroNode, node2: MetroNode): boolean {
		const distance = this.calculateDistance(node1.position, node2.position);
		const minDistance = this.config.interchangeRadius * 2;
		return distance < minDistance;
	}

	// Calculate Euclidean distance between two points
	calculateDistance(p1: Point, p2: Point): number {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
	}

	// Find all collisions in a set of nodes
	findCollisions(nodes: MetroNode[]): { node1: MetroNode, node2: MetroNode }[] {
		const collisions: { node1: MetroNode, node2: MetroNode }[] = [];

		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				if (this.detectNodeCollision(nodes[i], nodes[j])) {
					collisions.push({ node1: nodes[i], node2: nodes[j] });
				}
			}
		}

		return collisions;
	}

	// Resolve collisions by adjusting node positions
	resolveCollisions(nodes: MetroNode[]): MetroNode[] {
		const adjustedNodes = [...nodes];
		const collisions = this.findCollisions(adjustedNodes);

		collisions.forEach(({ node1, node2 }) => {
			// Simple resolution: push nodes apart slightly
			const dx = node2.position.x - node1.position.x;
			const dy = node2.position.y - node1.position.y;
			const distance = this.calculateDistance(node1.position, node2.position);
			const minDistance = this.config.interchangeRadius * 2;

			if (distance < minDistance) {
				const moveFactor = (minDistance - distance) / 2;
				const moveX = (dx / distance) * moveFactor;
				const moveY = (dy / distance) * moveFactor;

				// Move nodes apart
				node1.position.x -= moveX;
				node1.position.y -= moveY;
				node2.position.x += moveX;
				node2.position.y += moveY;
			}
		});

		return adjustedNodes;
	}
}