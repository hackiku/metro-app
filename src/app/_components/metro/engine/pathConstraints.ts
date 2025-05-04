// src/app/_components/metro/engine/pathConstraints.ts

import type { LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Calculate the angle of a line segment in degrees (0-360)
 */
function calculateSegmentAngle(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  // Calculate angle in radians and convert to degrees
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Normalize to 0-360 range
  if (angle < 0) angle += 360;
  
  return angle;
}

/**
 * Snap an angle to the nearest grid direction (0°, 45°, 90°, etc.)
 */
function snapAngleToGrid(angle: number, numDirections: number = 8): number {
  // Calculate angle step based on number of directions
  const angleStep = 360 / numDirections;
  
  // Calculate the nearest step
  const step = Math.round(angle / angleStep);
  
  // Calculate the snapped angle
  let snappedAngle = (step * angleStep) % 360;
  
  // Ensure we return a value in [0, 360)
  if (snappedAngle < 0) snappedAngle += 360;
  
  return snappedAngle;
}

/**
 * Check if a sequence of nodes forms a nearly straight line
 */
function areNodesCollinear(nodes: LayoutNode[], tolerance: number = 10): boolean {
  if (nodes.length < 3) return false;
  
  // Calculate angles between consecutive segments
  const angles: number[] = [];
  for (let i = 0; i < nodes.length - 2; i++) {
    const n1 = nodes[i];
    const n2 = nodes[i + 1];
    const n3 = nodes[i + 2];
    
    // Calculate the two segment vectors
    const v1 = { x: n2.x - n1.x, y: n2.y - n1.y };
    const v2 = { x: n3.x - n2.x, y: n3.y - n2.y };
    
    // Calculate angle between segments
    // First, get the segment angles
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    
    // Calculate the difference
    let angleDiff = (angle2 - angle1) * (180 / Math.PI);
    
    // Normalize to [-180, 180]
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;
    
    // If angleDiff is close to 0, segments are collinear
    if (Math.abs(angleDiff) < tolerance) {
      angles.push(angleDiff);
    } else {
      return false; // Not collinear if any segment pair isn't aligned
    }
  }
  
  // All consecutive segments are aligned
  return true;
}

/**
 * Find sequences of nodes that form straight lines longer than maxConsecutive
 */
function findLongStraightSequences(nodes: LayoutNode[], maxConsecutive: number): number[][] {
  const sequences: number[][] = [];
  
  // Need at least maxConsecutive+1 nodes to form a "too long" straight line
  if (nodes.length <= maxConsecutive) return sequences;
  
  // Check all possible subsequences of length maxConsecutive+1 and longer
  for (let start = 0; start <= nodes.length - (maxConsecutive + 1); start++) {
    // Try to find the longest straight sequence starting at this position
    let end = start + maxConsecutive;
    
    // Check if the initial window forms a straight line
    const currentSequence = nodes.slice(start, end + 1);
    if (!areNodesCollinear(currentSequence)) continue;
    
    // Try to extend the sequence as far as possible
    while (end + 1 < nodes.length) {
      const extendedSequence = nodes.slice(start, end + 2);
      if (areNodesCollinear(extendedSequence)) {
        end++;
      } else {
        break;
      }
    }
    
    // If we found a sequence of the right length or longer, add it
    if (end - start + 1 > maxConsecutive) {
      const indices = [];
      for (let i = start; i <= end; i++) {
        indices.push(i);
      }
      sequences.push(indices);
      
      // Skip ahead to avoid overlapping sequences
      start = end - 1;
    }
  }
  
  return sequences;
}

/**
 * Calculate a perpendicular offset to break a straight line
 */
function calculatePerpOffset(segment: {x1: number, y1: number, x2: number, y2: number}, strength: number): {dx: number, dy: number} {
  // Calculate segment vector
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  
  // Normalize
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 0.001) return { dx: 0, dy: strength }; // Safety check
  
  // Perpendicular vector (90° rotation)
  const perpX = -dy / length;
  const perpY = dx / length;
  
  return { 
    dx: perpX * strength, 
    dy: perpY * strength 
  };
}

/**
 * Enforce grid-aligned angles between consecutive nodes
 */
export function enforceGridAngles(
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
  
  // Process each path
  nodesByPath.forEach(pathNodes => {
    // Skip paths with too few nodes
    if (pathNodes.length < 2) return;
    
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
    
    // Process each segment
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const current = sortedNodes[i];
      const next = sortedNodes[i + 1];
      
      // Calculate current segment angle
      const angle = calculateSegmentAngle(current, next);
      
      // Snap to grid
      const snappedAngle = snapAngleToGrid(angle, config.numDirections);
      
      // If angles are already closely aligned, skip adjustment
      if (Math.abs(angle - snappedAngle) < 8) {
        continue;
      }
      
      // Calculate distance between nodes
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate the new position based on snapped angle
      const snappedRad = snappedAngle * Math.PI / 180;
      const newX = current.x + Math.cos(snappedRad) * distance;
      const newY = current.y + Math.sin(snappedRad) * distance;
      
      // Find and update the node in the original array
      const nodeIndex = adjustedNodes.findIndex(n => n.id === next.id);
      if (nodeIndex >= 0) {
        adjustedNodes[nodeIndex] = {
          ...adjustedNodes[nodeIndex],
          x: newX,
          y: newY
        };
        
        // Also update in sortedNodes for next iteration
        for (let j = 0; j < sortedNodes.length; j++) {
          if (sortedNodes[j].id === next.id) {
            sortedNodes[j] = {
              ...sortedNodes[j],
              x: newX,
              y: newY
            };
            break;
          }
        }
      }
    }
  });
  
  return adjustedNodes;
}

/**
 * Enforce the constraint that no more than maxConsecutive nodes should be in a straight line
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
    if (sortedNodes.length <= maxConsecutive) return;
    
    // Find sequences of nodes that form straight lines longer than maxConsecutive
    const longStraightSequences = findLongStraightSequences(sortedNodes, maxConsecutive);
    
    // Process each sequence
    longStraightSequences.forEach(sequence => {
      // Choose which nodes to offset - select one or more nodes in the middle
      const startOffset = Math.floor(maxConsecutive / 2);
      
      // For very long sequences, offset multiple nodes
      const nodesToOffset = [];
      for (let i = startOffset; i < sequence.length - 1; i += maxConsecutive) {
        nodesToOffset.push(sequence[i]);
      }
      
      // Apply offsets to chosen nodes
      nodesToOffset.forEach(nodeIndex => {
        const node = sortedNodes[nodeIndex];
        
        // Calculate offset based on neighboring nodes
        const prev = sortedNodes[nodeIndex - 1];
        const next = nodeIndex + 1 < sortedNodes.length ? sortedNodes[nodeIndex + 1] : null;
        
        if (!next) return; // Skip if no next node
        
        // Calculate offset from segment
        const segment = {
          x1: prev.x, 
          y1: prev.y,
          x2: next.x,
          y2: next.y
        };
        
        // Offset strength varies with sequence length for more natural appearance
        const sequenceLength = sequence.length;
        const strength = config.radiusStep * 0.15 * (1 + (sequenceLength - maxConsecutive) * 0.1);
        
        const offset = calculatePerpOffset(segment, strength);
        
        // Find the node in the adjustedNodes array
        const originalIndex = adjustedNodes.findIndex(n => n.id === node.id);
        if (originalIndex >= 0) {
          // Update position with offset
          adjustedNodes[originalIndex] = {
            ...adjustedNodes[originalIndex],
            x: node.x + offset.dx,
            y: node.y + offset.dy
          };
          
          // Also update in sortedNodes for next calculations
          for (let j = 0; j < sortedNodes.length; j++) {
            if (sortedNodes[j].id === node.id) {
              sortedNodes[j] = {
                ...sortedNodes[j],
                x: node.x + offset.dx,
                y: node.y + offset.dy
              };
              break;
            }
          }
        }
      });
    });
  });
  
  return adjustedNodes;
}