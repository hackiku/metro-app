// src/app/_components/metro/engine/nodeUtils.ts

import type { LayoutNode } from '~/types/engine';

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

export function calculateDistance(node1: LayoutNode, node2: LayoutNode): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function applySubtleJitter(nodes: LayoutNode[], maxJitter: number = 0): LayoutNode[] {
  return nodes; // Disabled
}

export function ensureMinimumDistance(
  nodes: LayoutNode[],
  scaledMinDistance: number,
  maxIterations: number = 30 // Increased default iterations
): LayoutNode[] {
  if (nodes.length < 2 || scaledMinDistance <= 0) return nodes;
  const adjustedNodes = nodes.map(node => ({ ...node }));
  const minDistanceSq = scaledMinDistance * scaledMinDistance;
  let adjustmentsMade = false;
  let iterationCount = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterationCount++;
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
          const adjustmentFactor = overlap / dist / 2;
          nodeI.x -= dx * adjustmentFactor;
          nodeI.y -= dy * adjustmentFactor;
          nodeJ.x += dx * adjustmentFactor;
          nodeJ.y += dy * adjustmentFactor;
          adjustmentsMade = true;
        } else if (distSq < 1e-9) {
           const angle = Math.random() * 2 * Math.PI;
           const push = scaledMinDistance / 2;
           nodeI.x -= Math.cos(angle) * push; nodeI.y -= Math.sin(angle) * push;
           nodeJ.x += Math.cos(angle) * push; nodeJ.y += Math.sin(angle) * push;
           adjustmentsMade = true;
        }
      }
    }
    if (!adjustmentsMade) break;
  }
  // if (iterationCount === maxIterations) console.warn(`ensureMinimumDistance reached max iterations (${maxIterations}).`);
  return adjustedNodes;
}

export function adjustOriginNodes(
    nodes: LayoutNode[],
    scaledMinDistance: number
): LayoutNode[] {
  return nodes.map(node => {
    const distOrigin = Math.sqrt(node.x * node.x + node.y * node.y);
    const effectiveMinDist = Math.max(scaledMinDistance, 1);
    if (distOrigin < effectiveMinDist) {
      const hash = node.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const angle = ((hash * 137) % 360) * (Math.PI / 180);
      return { ...node, x: Math.cos(angle) * effectiveMinDist, y: Math.sin(angle) * effectiveMinDist };
    }
    return node;
  });
}