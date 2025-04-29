// src/app/_components/metro/engine/pathRouting.ts
import { LayoutNode, Point, Direction } from './types';
import { GRID_CONFIG } from './config';

/**
 * Finds the best direction to move from one point to another
 * using only horizontal, vertical, or 45-degree diagonal movements
 */
export function findBestDirection(from: Point, to: Point): Direction {
  // Calculate vector from -> to
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Find the closest allowed direction
  let bestDirection: Direction = { x: 0, y: 0 };
  let bestMatch = -Infinity;
  
  for (const dir of GRID_CONFIG.allowedDirections) {
    // Normalize the test direction
    const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    const normalizedDir = {
      x: dir.x / length,
      y: dir.y / length
    };
    
    // Calculate how well this direction matches our target vector
    // using dot product
    const normalizedDx = dx === 0 ? 0 : dx / Math.abs(dx);
    const normalizedDy = dy === 0 ? 0 : dy / Math.abs(dy);
    const dotProduct = normalizedDir.x * normalizedDx + normalizedDir.y * normalizedDy;
    
    // If this is a better match, keep it
    if (dotProduct > bestMatch) {
      bestMatch = dotProduct;
      bestDirection = dir;
    }
  }
  
  return bestDirection;
}

/**
 * Generate path segments between nodes using Manhattan routing
 */
export function generateManhattanSegments(nodes: LayoutNode[]): Point[] {
  if (nodes.length < 2) return [];
  
  // Sort nodes by level for consistent ordering
  const sortedNodes = [...nodes].sort((a, b) => {
    // First sort by level
    const levelDiff = a.level - b.level;
    if (levelDiff !== 0) return levelDiff;
    
    // If levels are equal, try sequence_in_path
    if (a.sequence_in_path !== undefined && b.sequence_in_path !== undefined) {
      return a.sequence_in_path - b.sequence_in_path;
    }
    
    // Default to sorting by x, then y coordinates
    const xDiff = a.x - b.x;
    return xDiff !== 0 ? xDiff : a.y - b.y;
  });
  
  // Start with the first node
  const pathPoints: Point[] = [{ x: sortedNodes[0].x, y: sortedNodes[0].y }];
  
  // Connect each subsequent node
  for (let i = 1; i < sortedNodes.length; i++) {
    const prev = sortedNodes[i-1];
    const curr = sortedNodes[i];
    const start = { x: prev.x, y: prev.y };
    const end = { x: curr.x, y: curr.y };
    
    // Add intermediate points for Manhattan routing
    // Basic approach: move in one direction, then the other
    
    // Check if we need to move at all in either direction
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      // Points are very close, just draw direct line
      pathPoints.push(end);
      continue;
    }
    
    // Determine if we should move vertical or horizontal first
    // Simple heuristic: if more vertical distance, move vertical first
    const moveVerticalFirst = Math.abs(dy) > Math.abs(dx);
    
    if (moveVerticalFirst) {
      // Add intermediate point - vertical movement first
      if (Math.abs(dy) > 5) { // Only add if there's significant distance
        pathPoints.push({ x: start.x, y: end.y });
      }
    } else {
      // Add intermediate point - horizontal movement first
      if (Math.abs(dx) > 5) { // Only add if there's significant distance
        pathPoints.push({ x: end.x, y: start.y });
      }
    }
    
    // Add the final destination point
    pathPoints.push(end);
  }
  
  return pathPoints;
}

/**
 * Generate SVG path data for a series of points
 */
export function generateSvgPathData(points: Point[]): string {
  if (points.length === 0) return '';
  
  let pathData = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return pathData;
}

/**
 * Optimizes node positions to create a more visually appealing layout
 * This is a simple implementation that can be expanded later
 */
export function optimizeNodePositions(nodes: LayoutNode[]): LayoutNode[] {
  // For now, just make small adjustments to ensure nodes don't perfectly overlap
  // More sophisticated optimization could be added later
  
  const optimizedNodes = [...nodes];
  const nodePositions = new Map<string, { x: number, y: number }>();
  
  // First pass - mark all positions
  nodes.forEach(node => {
    const key = `${Math.round(node.x)},${Math.round(node.y)}`;
    nodePositions.set(key, { x: node.x, y: node.y });
  });
  
  // Second pass - adjust any nodes that are too close
  optimizedNodes.forEach(node => {
    const nodeKey = `${Math.round(node.x)},${Math.round(node.y)}`;
    
    // Check how many nodes are at this position
    let count = 0;
    nodes.forEach(n => {
      const key = `${Math.round(n.x)},${Math.round(n.y)}`;
      if (key === nodeKey) count++;
    });
    
    // If more than one node at this position, add slight offset
    if (count > 1) {
      const offsetX = (Math.random() - 0.5) * GRID_CONFIG.cellWidth * 0.3;
      const offsetY = (Math.random() - 0.5) * GRID_CONFIG.cellHeight * 0.3;
      
      node.x += offsetX;
      node.y += offsetY;
    }
  });
  
  return optimizedNodes;
}