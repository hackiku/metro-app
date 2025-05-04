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
 * Calculate the angle between two nodes in degrees (0-360°)
 */
export function calculateNodeAngle(from: LayoutNode, to: LayoutNode): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Calculate angle in radians and convert to degrees
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Normalize to 0-360 range
  if (angle < 0) angle += 360;
  
  return angle;
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
 * Check if an angle is approximately grid-aligned (0°, 45°, 90°, 135°, 180°, etc.)
 * @param angle - The angle to check in degrees
 * @param tolerance - Tolerance in degrees
 * @param numDirections - Number of grid directions (8 = 45° increments)
 */
export function isGridAligned(angle: number, tolerance: number = 5, numDirections: number = 8): boolean {
  // Calculate angle step
  const angleStep = 360 / numDirections;
  
  // Check if angle is close to any grid angle
  for (let i = 0; i < numDirections; i++) {
    const gridAngle = (i * angleStep) % 360;
    
    // Calculate minimum angle difference (handling 0/360 edge case)
    const diff1 = Math.abs(angle - gridAngle);
    const diff2 = Math.abs(angle - (gridAngle + 360));
    const diff3 = Math.abs((angle + 360) - gridAngle);
    
    const minDiff = Math.min(diff1, diff2, diff3);
    
    if (minDiff <= tolerance) {
      return true;
    }
  }
  
  return false;
}

/**
 * Apply a small jitter to node positions to avoid perfect overlaps
 * This adds visual interest while maintaining the overall layout
 */
export function applySubtleJitter(nodes: LayoutNode[], maxJitter: number = 2): LayoutNode[] {
  return nodes.map(node => {
    // Create a deterministic but semi-random offset based on node ID
    // This ensures consistent jitter between renders
    const nodeHash = node.id.split('').reduce((a, b) => {
      return a + b.charCodeAt(0);
    }, 0);
    
    // Calculate small offset
    // const jitterX = (((nodeHash * 13) % 100) / 100 - 0.5) * maxJitter;
    // const jitterY = (((nodeHash * 17) % 100) / 100 - 0.5) * maxJitter;
    const jitterX = 0;
    const jitterY = 0;
    
    return {
      ...node,
      x: node.x + jitterX,
      y: node.y + jitterY
    };
  });
}

/**
 * Ensure minimum distance between nodes to prevent overlaps
 */
export function ensureMinimumDistance(
  nodes: LayoutNode[], 
  minDistance: number = 5
): LayoutNode[] {
  const adjustedNodes = [...nodes];
  
  // Check each pair of nodes for potential overlap
  for (let i = 0; i < adjustedNodes.length; i++) {
    for (let j = i + 1; j < adjustedNodes.length; j++) {
      const distance = calculateDistance(adjustedNodes[i], adjustedNodes[j]);
      
      // If nodes are too close, adjust their positions
      if (distance < minDistance) {
        // Calculate adjustment vector
        const dx = adjustedNodes[j].x - adjustedNodes[i].x;
        const dy = adjustedNodes[j].y - adjustedNodes[i].y;
        const angle = Math.atan2(dy, dx);
        
        // Calculate how much additional distance is needed
        const adjustment = (minDistance - distance) / 5;
        
        // Move both nodes apart symmetrically
        adjustedNodes[i] = {
          ...adjustedNodes[i],
          x: adjustedNodes[i].x - Math.cos(angle) * adjustment,
          y: adjustedNodes[i].y - Math.sin(angle) * adjustment
        };
        
        adjustedNodes[j] = {
          ...adjustedNodes[j],
          x: adjustedNodes[j].x + Math.cos(angle) * adjustment,
          y: adjustedNodes[j].y + Math.sin(angle) * adjustment
        };
      }
    }
  }
  
  return adjustedNodes;
}

/**
 * Check if there are any nodes directly on the origin
 * and move them slightly if needed
 */
export function adjustOriginNodes(nodes: LayoutNode[], minDistance: number = 5): LayoutNode[] {
  return nodes.map(node => {
    // Check if node is very close to origin
    const distanceFromOrigin = Math.sqrt(node.x * node.x + node.y * node.y);
    
    if (distanceFromOrigin < minDistance) {
      // Use node properties to generate a consistent offset direction
      const hash = node.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      
      // Move the node outward from the origin
      return {
        ...node,
        x: Math.cos(angle) * minDistance,
        y: Math.sin(angle) * minDistance
      };
    }
    
    return node;
  });
}