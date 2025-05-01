// pathDrawer.ts
import type { LayoutNode, LayoutPath, Point, MetroConfig } from './types';
import { DEFAULT_CONFIG } from './config';

/**
 * Calculates which direction to move between two points,
 * constraining to allowed angles: horizontal, vertical, or 45°
 */
export function getSegmentDirection(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // If very close, no direction needed
  if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
    return { x: 0, y: 0 };
  }
  
  // Determine direction based on angle
  const angle = Math.atan2(dy, dx);
  const octant = Math.round(8 * angle / (2 * Math.PI) + 8) % 8;
  
  // Map octant to direction
  // 0: right, 1: bottom-right, 2: bottom, 3: bottom-left, etc.
  const directions = [
    { x: 1, y: 0 },   // right
    { x: 1, y: 1 },   // bottom-right
    { x: 0, y: 1 },   // bottom
    { x: -1, y: 1 },  // bottom-left
    { x: -1, y: 0 },  // left
    { x: -1, y: -1 }, // top-left
    { x: 0, y: -1 },  // top
    { x: 1, y: -1 }   // top-right
  ];
  
  return directions[octant];
}

/**
 * Generates path segments to connect nodes
 * Enforces constraints on allowed angles and consecutive segments
 */
export function generatePathSegments(
  nodes: LayoutNode[],
  config: MetroConfig = DEFAULT_CONFIG
): Point[] {
  if (nodes.length < 2) return [];
  
  // Sort nodes by level/sequence for consistent ordering
  const sortedNodes = [...nodes].sort((a, b) => {
    // First sort by level
    const levelDiff = a.level - b.level;
    if (levelDiff !== 0) return levelDiff;
    
    // Then by sequence if available
    if (a.sequence_in_path != null && b.sequence_in_path != null) {
      return a.sequence_in_path - b.sequence_in_path;
    }
    
    return 0;
  });
  
  // Start with the first node
  const pathPoints: Point[] = [{ x: sortedNodes[0].x, y: sortedNodes[0].y }];
  
  // Connect each subsequent node
  let lastDirection = { x: 0, y: 0 };
  let sameDirectionCount = 0;
  
  for (let i = 1; i < sortedNodes.length; i++) {
    const currentNode = sortedNodes[i];
    const lastPoint = pathPoints[pathPoints.length - 1];
    
    // Get optimal direction to move
    const targetDir = getSegmentDirection(lastPoint, currentNode);
    
    // If no direction needed (nodes very close), just add the target
    if (targetDir.x === 0 && targetDir.y === 0) {
      pathPoints.push({ x: currentNode.x, y: currentNode.y });
      continue;
    }
    
    // Check if this would be too many segments in same direction
    const isSameDirection = 
      (targetDir.x === lastDirection.x && targetDir.y === lastDirection.y);
    
    if (isSameDirection) {
      sameDirectionCount++;
    } else {
      sameDirectionCount = 0;
    }
    
    // If we've had too many consecutive segments in the same direction,
    // force a change in direction
    if (sameDirectionCount >= 2) {
      // Try a different direction (e.g., 90° turn)
      const alternateDir = { x: targetDir.y, y: targetDir.x };
      
      // Add an intermediate point with the alternate direction
      const intermediate = {
        x: lastPoint.x + alternateDir.x * 50,
        y: lastPoint.y + alternateDir.y * 50
      };
      
      pathPoints.push(intermediate);
      lastDirection = alternateDir;
      sameDirectionCount = 0;
    } else {
      // Continue in target direction
      lastDirection = targetDir;
    }
    
    // Add the final point (actual node)
    pathPoints.push({ x: currentNode.x, y: currentNode.y });
  }
  
  return pathPoints;
}

/**
 * Converts path points to SVG path data
 */
export function generateSvgPathData(points: Point[]): string {
  if (points.length === 0) return '';
  
  let pathData = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return pathData;
}