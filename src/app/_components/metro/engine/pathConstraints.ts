// src/app/_components/metro/engine/pathConstraints.ts

import type { LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

function calculateSegmentAngle(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

function snapAngleToGrid(angle: number, numDirections: number = 8): number {
  const effectiveNumDirections = Math.max(1, numDirections);
  const angleStep = 360 / effectiveNumDirections;
  const step = Math.round(angle / angleStep);
  let snappedAngle = (step * angleStep) % 360;
  if (snappedAngle < 0) snappedAngle += 360;
  return snappedAngle;
}

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

function calculatePerpOffset(
    segment: {x1: number, y1: number, x2: number, y2: number},
    baseStrength: number,
    scale: number
): {dx: number, dy: number} {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const scaledStrength = baseStrength * scale;
  if (length < 1e-6) return { dx: 0, dy: scaledStrength };
  const perpX = -dy / length;
  const perpY = dx / length;
  return { dx: perpX * scaledStrength, dy: perpY * scaledStrength };
}

export function enforceGridAngles(
  nodes: LayoutNode[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  const adjustedNodes = nodes.map(node => ({ ...node }));
  const nodeMap = new Map(adjustedNodes.map(n => [n.id, n]));
  const nodesByPath = new Map<string, string[]>();
  adjustedNodes.forEach(node => { if (!nodesByPath.has(node.careerPathId)) nodesByPath.set(node.careerPathId, []); nodesByPath.get(node.careerPathId)!.push(node.id); });
  let anglesAdjustedCount = 0;

  nodesByPath.forEach((pathNodeIds) => {
    if (pathNodeIds.length < 2) return;
    const sortedPathNodes = pathNodeIds.map(id => nodeMap.get(id)!).sort((a, b) => {
        const levelDiff = a.level - b.level;
        if (levelDiff !== 0) return levelDiff;
        if (a.sequence_in_path != null && b.sequence_in_path != null) return a.sequence_in_path - b.sequence_in_path;
        return 0;
      });

    for (let i = 0; i < sortedPathNodes.length - 1; i++) {
      const current = sortedPathNodes[i];
      const next = sortedPathNodes[i + 1];
      const currentAngle = calculateSegmentAngle(current, next);
      const snappedAngle = snapAngleToGrid(currentAngle, config.numDirections);
      let angleDiff = Math.abs(currentAngle - snappedAngle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;
      const tolerance = 1.0; // Strict tolerance
      if (angleDiff < tolerance) continue;

      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1e-6) continue;

      const snappedRad = snappedAngle * Math.PI / 180;
      const newX = current.x + Math.cos(snappedRad) * distance;
      const newY = current.y + Math.sin(snappedRad) * distance;
      next.x = newX;
      next.y = newY;
      anglesAdjustedCount++;
    }
  });

  // console.log(`Enforced grid angles: Adjusted ${anglesAdjustedCount} segment(s) to ${config.numDirections}-direction grid.`);
  return adjustedNodes;
}

export function enforceLineConstraints(
  nodes: LayoutNode[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
    const adjustedNodes = nodes.map(node => ({ ...node }));
    const nodeMap = new Map(adjustedNodes.map(n => [n.id, n]));
    const nodesByPath = new Map<string, string[]>();
    adjustedNodes.forEach(node => { if (!nodesByPath.has(node.careerPathId)) nodesByPath.set(node.careerPathId, []); nodesByPath.get(node.careerPathId)!.push(node.id); });
    const maxConsecutive = config.maxConsecutiveAligned ?? 3;
    const scale = config.globalScale;
    let bendsAppliedCount = 0;

    nodesByPath.forEach((pathNodeIds) => {
        if (pathNodeIds.length <= maxConsecutive) return;
        const sortedPathNodes = pathNodeIds.map(id => nodeMap.get(id)!).sort((a, b) => {
            const levelDiff = a.level - b.level;
            if (levelDiff !== 0) return levelDiff;
            if (a.sequence_in_path != null && b.sequence_in_path != null) return a.sequence_in_path - b.sequence_in_path;
            return 0;
         });
        const longStraightSequences = findLongStraightSequences(sortedPathNodes, maxConsecutive);
        const offsetNodes = new Set<string>();

        longStraightSequences.forEach(sequenceIndices => {
            const offsetStartIndex = Math.max(1, Math.floor(maxConsecutive / 2)); // Ensure start index is at least 1
            // Iterate to offset nodes, ensuring indices are valid
            for (let i = offsetStartIndex; i < sequenceIndices.length - 1; i += offsetStartIndex ) {
                 // Check bounds carefully
                if (i >= sequenceIndices.length || i <= 0) continue; // Basic bounds check

                const nodeIndexInPath = sequenceIndices[i];
                 // Check if indices exist in the sorted path
                if (nodeIndexInPath >= sortedPathNodes.length || nodeIndexInPath <= 0) continue;

                const nodeToOffset = sortedPathNodes[nodeIndexInPath];
                const prevNode = sortedPathNodes[nodeIndexInPath - 1];
                // Check if next node exists within the sequence indices and sorted path nodes
                if (nodeIndexInPath + 1 >= sortedPathNodes.length) continue;
                const nextNode = sortedPathNodes[nodeIndexInPath + 1];

                if (offsetNodes.has(nodeToOffset.id)) continue; // Avoid double offset

                const segment = { x1: prevNode.x, y1: prevNode.y, x2: nextNode.x, y2: nextNode.y };
                const baseStrength = (config.radiusStep * 0.20) * (1 + (sequenceIndices.length - maxConsecutive - 1) * 0.05); // Slightly increased base strength
                const offset = calculatePerpOffset(segment, baseStrength, scale);
                nodeToOffset.x += offset.dx;
                nodeToOffset.y += offset.dy;
                offsetNodes.add(nodeToOffset.id);
                bendsAppliedCount++;
            }
        });
    });
    // if (bendsAppliedCount > 0) console.log(`Applied ${bendsAppliedCount} bends due to maxConsecutiveAligned=${maxConsecutive}.`);
    return adjustedNodes;
}