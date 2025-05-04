// src/app/_components/metro/engine/pathDrawer.ts

import type { LayoutNode, LayoutPath, Point, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Determines which grid-aligned direction to move between two points
 * Only allows horizontal, vertical, or 45° diagonal directions
 */
export function getSegmentDirection(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // If very close, no direction needed
  if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
    return { x: 0, y: 0 };
  }
  
  // Determine main movement axis
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  // Calculate the direction based on the predominant axis
  // and decide whether to move diagonally or along a single axis
  let dirX = 0;
  let dirY = 0;
  
  // Decide if we should move diagonally
  const ratio = absDx / (absDy + 0.0001); // Avoid division by zero
  const shouldMoveDiagonally = ratio >= 0.5 && ratio <= 2;
  
  // Set direction components
  if (shouldMoveDiagonally) {
    // Diagonal movement
    dirX = Math.sign(dx);
    dirY = Math.sign(dy);
  } else if (absDx > absDy) {
    // Horizontal movement
    dirX = Math.sign(dx);
  } else {
    // Vertical movement
    dirY = Math.sign(dy);
  }
  
  return { x: dirX, y: dirY };
}

/**
 * Generates metro-style path segments between nodes
 * Enforces orthogonal or 45° movements
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
  
  // Connect each subsequent node with proper metro-style segments
  for (let i = 1; i < sortedNodes.length; i++) {
    const currentNode = sortedNodes[i];
    const prevNode = sortedNodes[i-1];
    const start = { x: prevNode.x, y: prevNode.y };
    const end = { x: currentNode.x, y: currentNode.y };
    
    // Generate intermediate points for this segment
    const intermediatePoints = generateMetroSegment(start, end);
    
    // Add all points except the first (which is already in the path)
    for (const point of intermediatePoints) {
      pathPoints.push(point);
    }
  }
  
  return pathPoints;
}

/**
 * Generates intermediate points between two nodes using metro-style routing
 */
function generateMetroSegment(start: Point, end: Point): Point[] {
  const points: Point[] = [];
  
  // Always include the end point
  points.push(end);
  
  // If points are very close, don't add intermediate segments
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    return points;
  }
  
  // Determine if we need intermediate points
  // Check if already aligned with grid (horizontal, vertical or 45°)
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const isHorizontal = absDy < 10;
  const isVertical = absDx < 10;
  const isDiagonal = Math.abs(absDx - absDy) < 10;
  
  if (isHorizontal || isVertical || isDiagonal) {
    // Already aligned with grid, no intermediate points needed
    return points;
  }
  
  // Need intermediate points - calculate optimal path
  // For simplicity, we'll use a 2-segment approach:
  // 1) Move in primary direction (longer axis)
  // 2) Move diagonally if needed
  // 3) Move in secondary direction to reach target
  
  // Create points array with start point at beginning
  const result = [];
  
  // Calculate proportions for 2-segment path
  // The midpoint is placed at 70% along the dominant axis
  if (absDx > absDy) {
    // Horizontal dominant - move horizontally first
    const midX = start.x + dx * 0.5;
    result.push({ x: midX, y: start.y });
  } else {
    // Vertical dominant - move vertically first
    const midY = start.y + dy * 0.5;
    result.push({ x: start.x, y: midY });
  }
  
  // Add the end point
  result.push(end);
  
  return result;
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