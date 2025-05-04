// src/app/_components/metro/engine/nodeUtils.ts

import type { LayoutNode } from '~/types/engine';

// identifyInterchangeNodes, calculateDistance, calculateNodeAngle unchanged

/**
 * Identify interchange nodes (nodes whose positions appear in multiple paths)
 */
export function identifyInterchangeNodes(nodes: LayoutNode[]): LayoutNode[] {
  const positionPaths = new Map<string, Set<string>>();
  nodes.forEach(node => {
    if (!positionPaths.has(node.positionId)) positionPaths.set(node.positionId, new Set());
    positionPaths.get(node.positionId)!.add(node.careerPathId);
  });
  return nodes.map(node => {
    const paths = positionPaths.get(node.positionId) ?? new Set();
    const isInterchange = paths.size > 1;
    return { ...node, isInterchange, relatedPaths: isInterchange ? Array.from(paths) : undefined };
  });
}

/**
 * Calculate distance between two nodes
 */
export function calculateDistance(node1: LayoutNode, node2: LayoutNode): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}


/**
 * Apply subtle jitter - DISABLED
 */
export function applySubtleJitter(nodes: LayoutNode[], maxJitter: number = 0): LayoutNode[] {
  // Jitter is disabled for predictability
  return nodes;
}

/**
 * Ensure minimum distance between nodes, respecting global scale.
 */
export function ensureMinimumDistance(
  nodes: LayoutNode[],
  scaledMinDistance: number, // Expect the already scaled distance
  maxIterations: number = 20 // Increased iterations
): LayoutNode[] {
  if (nodes.length < 2 || scaledMinDistance <= 0) return nodes;

  const adjustedNodes = nodes.map(node => ({ ...node }));
  const minDistanceSq = scaledMinDistance * scaledMinDistance;
  let adjustmentsMade = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    adjustmentsMade = false;
    for (let i = 0; i < adjustedNodes.length; i++) {
      for (let j = i + 1; j < adjustedNodes.length; j++) {
        const nodeI = adjustedNodes[i];
        const nodeJ = adjustedNodes[j];

        const dx = nodeJ.x - nodeI.x;
        const dy = nodeJ.y - nodeI.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistanceSq && distSq > 1e-9) {
          const dist = Math.sqrt(distSq);
          const overlap = scaledMinDistance - dist;
          // Move nodes apart proportionally to the overlap
          const adjustmentFactor = overlap / dist / 2; // Move each node half the overlap

          nodeI.x -= dx * adjustmentFactor;
          nodeI.y -= dy * adjustmentFactor;
          nodeJ.x += dx * adjustmentFactor;
          nodeJ.y += dy * adjustmentFactor;
          adjustmentsMade = true;
        } else if (distSq < 1e-9) { // Nodes are virtually identical
           const angle = Math.random() * 2 * Math.PI;
           const push = scaledMinDistance / 2;
           nodeI.x -= Math.cos(angle) * push; nodeI.y -= Math.sin(angle) * push;
           nodeJ.x += Math.cos(angle) * push; nodeJ.y += Math.sin(angle) * push;
           adjustmentsMade = true;
        }
      }
    }
    if (!adjustmentsMade) break; // Stop if layout stabilized
     if (iter === maxIterations - 1) {
       console.warn(`ensureMinimumDistance reached max iterations (${maxIterations}).`);
     }
  }
  return adjustedNodes;
}

/**
 * Adjust nodes near origin, respecting global scale.
 */
export function adjustOriginNodes(
    nodes: LayoutNode[],
    scaledMinDistance: number // Expect already scaled distance
): LayoutNode[] {
  return nodes.map(node => {
    const distOrigin = Math.sqrt(node.x * node.x + node.y * node.y);
    const effectiveMinDist = Math.max(scaledMinDistance, 1); // Ensure at least 1

    if (distOrigin < effectiveMinDist) {
      const hash = node.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const angle = ((hash * 137) % 360) * (Math.PI / 180);
      return {
        ...node,
        x: Math.cos(angle) * effectiveMinDist,
        y: Math.sin(angle) * effectiveMinDist
      };
    }
    return node;
  });
}