// src/app/_components/metro/engine/pathConstraints.ts

import type { LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Calculate the angle between three points in degrees
 */
function calculateAngle(p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}): number {
  // Calculate vectors
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  // Calculate dot product
  const dot = v1.x * v2.x + v1.y * v2.y;
  
  // Calculate magnitudes
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  // Calculate angle in radians and convert to degrees
  const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
  
  return angle;
}

/**
 * Check if three points form a nearly straight line (angle close to 180°)
 */
function areAligned(p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}): boolean {
  const angle = calculateAngle(p1, p2, p3);
  // If angle is close to 180° (within 10°), points are considered aligned
  return Math.abs(angle - 180) < 10;
}

/**
 * Check the alignment of consecutive nodes in a path
 * Returns the longest sequence of aligned nodes
 */
function findAlignedSequences(nodes: LayoutNode[]): number[][] {
  if (nodes.length < 3) return [];
  
  const alignedSequences: number[][] = [];
  let currentSequence: number[] = [0, 1];
  
  // Check consecutive triplets
  for (let i = 2; i < nodes.length; i++) {
    // Check if current node aligns with the last two in the sequence
    const p1 = nodes[currentSequence[currentSequence.length - 2]];
    const p2 = nodes[currentSequence[currentSequence.length - 1]];
    const p3 = nodes[i];
    
    if (areAligned(p1, p2, p3)) {
      // Extend the current sequence
      currentSequence.push(i);
    } else {
      // If we had a sequence of at least 3 aligned nodes, save it
      if (currentSequence.length >= 3) {
        alignedSequences.push([...currentSequence]);
      }
      // Start a new sequence with the last node and current node
      currentSequence = [i-1, i];
    }
  }
  
  // Check if the last sequence was aligned
  if (currentSequence.length >= 3) {
    alignedSequences.push(currentSequence);
  }
  
  return alignedSequences;
}

/**
 * Calculate a perpendicular offset to break alignment
 */
function calculatePerpOffset(p1: {x: number, y: number}, p2: {x: number, y: number}, strength: number = 10): {dx: number, dy: number} {
  // Get vector from p1 to p2
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  // Normalize vector length
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 0.001) return { dx: 0, dy: strength }; // Avoid division by zero
  
  const nx = dx / length;
  const ny = dy / length;
  
  // Perpendicular vector (90° rotation)
  const perpX = -ny;
  const perpY = nx;
  
  return { dx: perpX * strength, dy: perpY * strength };
}

/**
 * Enforce the constraint that no more than maxConsecutive nodes should be aligned
 */
export function enforceLineConstraints(
  nodes: LayoutNode[], 
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  // Clone nodes to avoid modifying original
  const adjustedNodes = [...nodes];
  
  // Group nodes by career path
  const nodesByPath = new Map<string, LayoutNode[]>();
  adjustedNodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  // Maximum consecutive nodes in a line
  const maxConsecutive = config.maxConsecutiveAligned || 3;
  
  // Process each path
  nodesByPath.forEach(pathNodes => {
    // Sort nodes by level and sequence
    const sortedNodes = [...pathNodes].sort((a, b) => {
      // First sort by level
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      
      // Then by sequence if available
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      
      return 0;
    });
    
    // Skip paths with too few nodes
    if (sortedNodes.length < maxConsecutive + 1) return;
    
    // Find aligned sequences
    const alignedSequences = findAlignedSequences(sortedNodes);
    
    // Adjust nodes in sequences longer than maxConsecutive
    alignedSequences.forEach(sequence => {
      if (sequence.length <= maxConsecutive) return;
      
      // We need to break this sequence by adjusting some nodes
      // Choose which nodes to adjust - pick every other node after the first maxConsecutive
      for (let i = maxConsecutive; i < sequence.length; i += 2) {
        const nodeIndex = sequence[i];
        const nodeToAdjust = sortedNodes[nodeIndex];
        
        // Calculate offset based on surrounding nodes
        const prevNode = sortedNodes[nodeIndex - 1];
        const nextNode = nodeIndex + 1 < sortedNodes.length ? sortedNodes[nodeIndex + 1] : null;
        
        // Calculate the strength of the adjustment based on path radius
        const strength = config.radiusStep * 0.2;
        
        // Apply offset perpendicular to the path direction
        const offset = calculatePerpOffset(prevNode, nodeToAdjust, strength);
        
        // Find this node in the original array and update it
        const originalIndex = adjustedNodes.findIndex(n => n.id === nodeToAdjust.id);
        if (originalIndex >= 0) {
          adjustedNodes[originalIndex] = {
            ...adjustedNodes[originalIndex],
            x: adjustedNodes[originalIndex].x + offset.dx,
            y: adjustedNodes[originalIndex].y + offset.dy
          };
        }
      }
    });
  });
  
  return adjustedNodes;
}

/**
 * Enforce grid-aligned angles between nodes
 */
export function enforceAngleConstraints(
  nodes: LayoutNode[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  // Implementation for angle snapping would go here
  // This would ensure that angles between consecutive nodes align to 0°, 45°, 90° etc.
  
  // For now, we're handling this in the initial node placement
  return nodes;
}