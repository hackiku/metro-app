// src/app/_components/metro/engine/pathConstraints.ts

import type { LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

// calculateSegmentAngle, snapAngleToGrid, areNodesCollinear, findLongStraightSequences
// These helper functions remain unchanged from the previous version.

/**
 * Calculate the angle of a line segment in degrees (0-360)
 */
function calculateSegmentAngle(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Snap an angle to the nearest grid direction defined by config.numDirections.
 */
function snapAngleToGrid(angle: number, numDirections: number = 8): number {
  // Ensure numDirections is at least 1 to avoid division by zero
  const effectiveNumDirections = Math.max(1, numDirections);
  const angleStep = 360 / effectiveNumDirections;
  const step = Math.round(angle / angleStep);
  let snappedAngle = (step * angleStep) % 360;
  if (snappedAngle < 0) snappedAngle += 360;
  return snappedAngle;
}

/**
 * Check if a sequence of nodes forms a nearly straight line
 */
function areNodesCollinear(nodes: LayoutNode[], tolerance: number = 5): boolean {
  if (nodes.length < 3) return false;
  const firstAngle = calculateSegmentAngle(nodes[0], nodes[1]);
  for (let i = 1; i < nodes.length - 1; i++) {
    const currentAngle = calculateSegmentAngle(nodes[i], nodes[i + 1]);
    let angleDiff = Math.abs(currentAngle - firstAngle);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    if (angleDiff > tolerance) return false;
  }
  return true;
}

/**
 * Find sequences of nodes that form straight lines longer than maxConsecutive
 */
function findLongStraightSequences(nodes: LayoutNode[], maxConsecutive: number): number[][] {
    const sequences: number[][] = [];
    if (nodes.length <= maxConsecutive) return sequences;
    for (let start = 0; start <= nodes.length - (maxConsecutive + 1); start++) {
        let end = start + maxConsecutive;
        while (end < nodes.length) {
            const currentSequence = nodes.slice(start, end + 1);
            if (areNodesCollinear(currentSequence)) {
                if (end + 1 < nodes.length) {
                    const extendedSequence = nodes.slice(start, end + 2);
                    if (!areNodesCollinear(extendedSequence)) break;
                }
                end++;
            } else break;
        }
         if (end - start >= maxConsecutive) {
             const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
             sequences.push(indices);
             start = end -1;
         }
    }
    return sequences;
}


/**
 * Calculate a perpendicular offset, applying global scale.
 */
function calculatePerpOffset(
    segment: {x1: number, y1: number, x2: number, y2: number},
    baseStrength: number, // Strength before scaling
    scale: number
): {dx: number, dy: number} {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const scaledStrength = baseStrength * scale; // Apply scale

  if (length < 1e-6) return { dx: 0, dy: scaledStrength }; // Handle zero length

  const perpX = -dy / length;
  const perpY = dx / length;

  return {
    dx: perpX * scaledStrength,
    dy: perpY * scaledStrength
  };
}

/**
 * Enforces grid-aligned angles between consecutive nodes using config.numDirections.
 * This function applies the strict 0/45/90 constraints.
 */
export function enforceGridAngles(
  nodes: LayoutNode[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  const adjustedNodes = nodes.map(node => ({ ...node }));
  const nodeMap = new Map(adjustedNodes.map(n => [n.id, n]));

  const nodesByPath = new Map<string, string[]>();
  adjustedNodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) nodesByPath.set(node.careerPathId, []);
    nodesByPath.get(node.careerPathId)!.push(node.id);
  });

  nodesByPath.forEach((pathNodeIds) => {
    if (pathNodeIds.length < 2) return;

    const sortedPathNodes = pathNodeIds
      .map(id => nodeMap.get(id)!)
      .sort((a, b) => { /* ... sort logic unchanged ... */
        const levelDiff = a.level - b.level;
        if (levelDiff !== 0) return levelDiff;
        if (a.sequence_in_path != null && b.sequence_in_path != null) {
          return a.sequence_in_path - b.sequence_in_path;
        }
        return 0;
      });

    for (let i = 0; i < sortedPathNodes.length - 1; i++) {
      const current = sortedPathNodes[i];
      const next = sortedPathNodes[i + 1];

      const angle = calculateSegmentAngle(current, next);
      // --- CRITICAL: Use config.numDirections for snapping grid ---
      const snappedAngle = snapAngleToGrid(angle, config.numDirections);

      let angleDiff = Math.abs(angle - snappedAngle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      const tolerance = 1.5; // Tight tolerance
      if (angleDiff < tolerance) continue;

      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1e-6) continue;

      // Recalculate 'next' position based on 'current', distance, and the SNAPPED angle
      const snappedRad = snappedAngle * Math.PI / 180;
      const newX = current.x + Math.cos(snappedRad) * distance;
      const newY = current.y + Math.sin(snappedRad) * distance;

      // Update node in the map
      next.x = newX;
      next.y = newY;
    }
  });

  console.log(`Enforced grid angles using ${config.numDirections} directions.`);
  return adjustedNodes;
}


/**
 * Enforces line constraints, applying perpendicular offsets scaled by config.globalScale.
 */
export function enforceLineConstraints(
  nodes: LayoutNode[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  const adjustedNodes = nodes.map(node => ({ ...node }));
  const nodeMap = new Map(adjustedNodes.map(n => [n.id, n]));

  const nodesByPath = new Map<string, string[]>();
  adjustedNodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) nodesByPath.set(node.careerPathId, []);
    nodesByPath.get(node.careerPathId)!.push(node.id);
  });

  const maxConsecutive = config.maxConsecutiveAligned ?? 3;
  const scale = config.globalScale; // Get scale factor

  nodesByPath.forEach((pathNodeIds) => {
     if (pathNodeIds.length <= maxConsecutive) return;

     const sortedPathNodes = pathNodeIds
        .map(id => nodeMap.get(id)!)
        .sort((a, b) => { /* ... sort logic unchanged ... */
            const levelDiff = a.level - b.level;
            if (levelDiff !== 0) return levelDiff;
            if (a.sequence_in_path != null && b.sequence_in_path != null) {
              return a.sequence_in_path - b.sequence_in_path;
            }
            return 0;
         });

    const longStraightSequences = findLongStraightSequences(sortedPathNodes, maxConsecutive);
    const offsetNodes = new Set<string>();

    longStraightSequences.forEach(sequenceIndices => {
      const offsetStartIndex = Math.floor(maxConsecutive / 2);
      for (let i = offsetStartIndex; i < sequenceIndices.length -1; i += (offsetStartIndex + 1)) {
         const nodeIndexInPath = sequenceIndices[i];
         const nodeToOffset = sortedPathNodes[nodeIndexInPath];

         if (offsetNodes.has(nodeToOffset.id)) continue;

         const prevNode = sortedPathNodes[nodeIndexInPath - 1];
         const nextNode = sortedPathNodes[nodeIndexInPath + 1];
         const segment = { x1: prevNode.x, y1: prevNode.y, x2: nextNode.x, y2: nextNode.y };

         // Calculate BASE offset strength (before scaling)
         const baseStrength = (config.radiusStep * 0.15) * (1 + (sequenceIndices.length - maxConsecutive - 1) * 0.05);

         // Calculate scaled perpendicular offset
         const offset = calculatePerpOffset(segment, baseStrength, scale); // Pass scale

         nodeToOffset.x += offset.dx;
         nodeToOffset.y += offset.dy;
         offsetNodes.add(nodeToOffset.id);
      }
    });
  });

  return adjustedNodes;
}