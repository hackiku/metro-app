// src/app/_components/metro/engine/manhattanRoute.ts
import type { LayoutNode } from './types';
import { DEFAULT_ROUTE_OPTIONS, ManhattanRouteOptions } from './config';
import { sortPathNodes } from './calculations';

/**
 * Route types for metro lines
 */
export type RouteMode = 'direct' | 'manhattan' | 'smooth';

/**
 * Generate appropriate path data based on route mode
 */
export function generatePath(
  nodes: LayoutNode[],
  routeMode: RouteMode = 'manhattan',
  options: ManhattanRouteOptions = {}
): string {
  switch (routeMode) {
    case 'direct':
      return generateDirectPath(nodes);
    case 'smooth':
      return generateSmoothManhattanPath(nodes, { 
        ...options, 
        cornerRadius: options.cornerRadius ?? 10 
      });
    case 'manhattan':
    default:
      return generateManhattanPath(nodes, options);
  }
}

/**
 * Generates a manhattan route SVG path string between nodes
 * 
 * @param nodes Array of nodes to connect
 * @param options Manhattan routing options
 * @returns SVG path data string
 */
export function generateManhattanPath(
  nodes: LayoutNode[],
  options: ManhattanRouteOptions = {}
): string {
  if (nodes.length < 2) return '';
  
  // Merge with default options
  const routeOptions = { ...DEFAULT_ROUTE_OPTIONS, ...options };
  
  // Sort nodes by level and sequence
  const sortedNodes = sortPathNodes(nodes);

  // Generate path data
  let pathData = `M ${sortedNodes[0].x} ${sortedNodes[0].y}`;
  
  // Strategy: Create Manhattan paths between consecutive nodes
  for (let i = 1; i < sortedNodes.length; i++) {
    const prev = sortedNodes[i-1];
    const curr = sortedNodes[i];
    
    // Check if the nodes are at different levels
    const levelChange = prev.level !== curr.level;
    
    // For vertical-first routing
    if (routeOptions.verticalFirst) {
      // Different levels - prioritize vertical movement
      if (levelChange || Math.abs(prev.y - curr.y) > routeOptions.minSegmentLength!) {
        // Go vertically first to align with the target y
        pathData += ` L ${prev.x} ${curr.y}`;
      }
      
      // If we still need to move horizontally
      if (Math.abs(prev.x - curr.x) > routeOptions.minSegmentLength!) {
        pathData += ` L ${curr.x} ${curr.y}`;
      }
    } 
    // For horizontal-first routing
    else {
      // Go horizontally first
      if (Math.abs(prev.x - curr.x) > routeOptions.minSegmentLength!) {
        pathData += ` L ${curr.x} ${prev.y}`;
      }
      
      // Then vertically
      if (Math.abs(prev.y - curr.y) > routeOptions.minSegmentLength!) {
        pathData += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    // If we didn't add any intermediate points, add a direct line
    if (pathData.endsWith(`M ${prev.x} ${prev.y}`)) {
      pathData += ` L ${curr.x} ${curr.y}`;
    }
  }
  
  return pathData;
}

/**
 * Generates a smooth manhattan route with rounded corners
 */
export function generateSmoothManhattanPath(
  nodes: LayoutNode[],
  options: ManhattanRouteOptions = {}
): string {
  if (nodes.length < 2) return '';
  const cornerRadius = options.cornerRadius || 0;
  
  // If corner radius is 0, just return regular manhattan path
  if (cornerRadius <= 0) {
    return generateManhattanPath(nodes, options);
  }
  
  // Sort nodes by level and sequence
  const sortedNodes = sortPathNodes(nodes);
  
  // Start with the first point
  let pathData = `M ${sortedNodes[0].x} ${sortedNodes[0].y}`;
  
  // First generate all corner points using the manhattan algorithm
  const corners: { x: number, y: number }[] = [{ x: sortedNodes[0].x, y: sortedNodes[0].y }];
  
  // Strategy: Create Manhattan corner points between consecutive nodes
  for (let i = 1; i < sortedNodes.length; i++) {
    const prev = sortedNodes[i-1];
    const curr = sortedNodes[i];
    
    if (options.verticalFirst) {
      // Add intermediate corner
      corners.push({ x: prev.x, y: curr.y });
    } else {
      // Add intermediate corner
      corners.push({ x: curr.x, y: prev.y });
    }
    
    // Add destination point
    corners.push({ x: curr.x, y: curr.y });
  }
  
  // Now generate path with rounded corners
  // First point is always a move command
  pathData = `M ${corners[0].x} ${corners[0].y}`;
  
  // Process each triplet of points to find where to place arc commands
  for (let i = 1; i < corners.length - 1; i++) {
    const prev = corners[i-1];
    const curr = corners[i];
    const next = corners[i+1];
    
    // Calculate distances
    const distToPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const distToNext = Math.hypot(next.x - curr.x, next.y - curr.y);
    
    // Use smaller of the two distances and cap radius
    const maxRadius = Math.min(distToPrev / 2, distToNext / 2, cornerRadius);
    
    // Skip if segments are too short for rounding
    if (maxRadius < 2) {
      pathData += ` L ${curr.x} ${curr.y}`;
      continue;
    }
    
    // Calculate direction vectors
    const toPrev = { x: (prev.x - curr.x) / distToPrev, y: (prev.y - curr.y) / distToPrev };
    const toNext = { x: (next.x - curr.x) / distToNext, y: (next.y - curr.y) / distToNext };
    
    // Calculate arc start and end points
    const arcStart = { 
      x: curr.x + toPrev.x * maxRadius, 
      y: curr.y + toPrev.y * maxRadius 
    };
    
    const arcEnd = { 
      x: curr.x + toNext.x * maxRadius, 
      y: curr.y + toNext.y * maxRadius 
    };
    
    // Add line to arc start, then add the arc
    pathData += ` L ${arcStart.x} ${arcStart.y}`;
    
    // Determine if we're making a right or left turn for sweep flag
    // Right turn = cross product is negative
    const crossProduct = toPrev.x * toNext.y - toPrev.y * toNext.x;
    const sweepFlag = crossProduct < 0 ? 1 : 0;
    
    // Add the arc command
    pathData += ` A ${maxRadius} ${maxRadius} 0 0 ${sweepFlag} ${arcEnd.x} ${arcEnd.y}`;
  }
  
  // Add final line to last point
  pathData += ` L ${corners[corners.length - 1].x} ${corners[corners.length - 1].y}`;
  
  return pathData;
}

/**
 * Generates a direct path between nodes (straight lines)
 */
export function generateDirectPath(nodes: LayoutNode[]): string {
  if (nodes.length < 2) return '';
  
  // Sort nodes as with other methods
  const sortedNodes = sortPathNodes(nodes);
  
  // Simple direct lines
  let pathData = `M ${sortedNodes[0].x} ${sortedNodes[0].y}`;
  
  for (let i = 1; i < sortedNodes.length; i++) {
    pathData += ` L ${sortedNodes[i].x} ${sortedNodes[i].y}`;
  }
  
  return pathData;
}