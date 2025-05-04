// src/app/_components/metro/engine/nodeUtils.ts

import type { LayoutNode } from '~/types/engine';

/**
 * Identify interchange nodes (nodes whose positions appear in multiple paths)
 * This helps visually distinguish important stations
 */
export function identifyInterchangeNodes(nodes: LayoutNode[]): LayoutNode[] {
  // Find positions that appear in multiple career paths
  const positionPaths = new Map<string, Set<string>>();
  
  // Count career paths per position
  nodes.forEach(node => {
    if (!positionPaths.has(node.positionId)) {
      positionPaths.set(node.positionId, new Set());
    }
    positionPaths.get(node.positionId)!.add(node.careerPathId);
  });
  
  // Mark nodes as interchanges if their position appears in multiple paths
  return nodes.map(node => {
    const pathCount = positionPaths.get(node.positionId)?.size || 0;
    const relatedPaths = Array.from(positionPaths.get(node.positionId) || []);
    
    return {
      ...node,
      isInterchange: pathCount > 1,
      relatedPaths: pathCount > 1 ? relatedPaths : undefined
    };
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
 * Calculate the angle between three nodes in degrees
 */
export function calculateAngleBetweenNodes(
  node1: LayoutNode, 
  node2: LayoutNode, 
  node3: LayoutNode
): number {
  // Create vectors
  const v1 = {
    x: node1.x - node2.x,
    y: node1.y - node2.y
  };
  
  const v2 = {
    x: node3.x - node2.x,
    y: node3.y - node2.y
  };
  
  // Calculate dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  
  // Calculate magnitudes
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  // Prevent division by zero
  if (mag1 === 0 || mag2 === 0) return 0;
  
  // Calculate angle in radians and convert to degrees
  const cosAngle = Math.min(Math.max(dotProduct / (mag1 * mag2), -1), 1);
  const angleRad = Math.acos(cosAngle);
  const angleDeg = angleRad * (180 / Math.PI);
  
  return angleDeg;
}

/**
 * Get the direction from one node to another (0 to 360 degrees)
 */
export function getDirection(from: LayoutNode, to: LayoutNode): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Calculate angle in radians and convert to degrees
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Normalize to 0-360 range
  if (angle < 0) angle += 360;
  
  return angle;
}

/**
 * Check if a direction is approximately aligned with the grid
 * (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
 */
export function isGridAligned(angle: number, tolerance: number = 10): boolean {
  // Grid angles
  const gridAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  
  // Check if angle is within tolerance of any grid angle
  return gridAngles.some(gridAngle => {
    // Handle 0°/360° edge case
    if (gridAngle === 0 && Math.abs(angle - 360) < tolerance) return true;
    return Math.abs(angle - gridAngle) < tolerance;
  });
}