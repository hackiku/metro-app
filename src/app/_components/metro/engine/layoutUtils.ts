// src/app/_components/metro/engine/layoutUtils.ts

import type { LayoutNode, LayoutBounds, PositionDetail } from './types';

/**
 * Calculates the bounding box encompassing all provided nodes.
 * Adds padding around the calculated min/max values.
 */
export function calculateBounds(nodes: LayoutNode[], padding: number): LayoutBounds {
	if (nodes.length === 0) {
		return { minX: -padding, maxX: padding, minY: -padding, maxY: padding };
	}

	let minX = nodes[0].x; let maxX = nodes[0].x;
	let minY = nodes[0].y; let maxY = nodes[0].y;

	for (let i = 1; i < nodes.length; i++) {
		minX = Math.min(minX, nodes[i].x);
		maxX = Math.max(maxX, nodes[i].x);
		minY = Math.min(minY, nodes[i].y);
		maxY = Math.max(maxY, nodes[i].y);
	}

	return {
		minX: minX - padding, maxX: maxX + padding,
		minY: minY - padding, maxY: maxY + padding,
	};
}

/**
 * Finds the minimum, maximum, and middle level from position details.
 */
export function getLevelInfo(positionDetails: PositionDetail[]): { minLevel: number; maxLevel: number; midLevel: number } {
	if (positionDetails.length === 0) {
		return { minLevel: 1, maxLevel: 1, midLevel: 1 };
	}

	let minLevel = Infinity;
	let maxLevel = -Infinity;
	positionDetails.forEach(detail => {
		minLevel = Math.min(minLevel, detail.level);
		maxLevel = Math.max(maxLevel, detail.level);
	});

    // Handle case where min/max are still Infinity (e.g., empty array after filtering)
    if (minLevel === Infinity) minLevel = 1;
    if (maxLevel === -Infinity) maxLevel = minLevel;

	const midLevel = (minLevel + maxLevel) / 2;
	return { minLevel, maxLevel, midLevel };
}


/**
 * Calculates how many paths each position appears in.
 * @param positionDetails - Array of all PositionDetail objects.
 * @returns A Map where keys are position_id and values are arrays of career_path_id.
 */
export function mapPathsToPositions(positionDetails: PositionDetail[]): Map<string, string[]> {
    const pathsByPosition = new Map<string, string[]>();
    positionDetails.forEach(detail => {
        if (!pathsByPosition.has(detail.position_id)) {
            pathsByPosition.set(detail.position_id, []);
        }
        // Ensure path ID is added only once per position
        const paths = pathsByPosition.get(detail.position_id)!;
        if (!paths.includes(detail.career_path_id)) {
            paths.push(detail.career_path_id);
        }
    });
    return pathsByPosition;
}