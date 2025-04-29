// src/app/_components/metro/engine/manhattanRoute.ts
import type { LayoutNode } from './types';

/**
 * Route types for metro lines
 */
export type RouteMode = 'direct' | 'manhattan' | 'smooth';

/**
 * Route point with x, y coordinates and optional control points
 */
export interface RoutePoint {
  x: number;
  y: number;
  controlX1?: number; // For cubic bezier curves
  controlY1?: number;
  controlX2?: number;
  controlY2?: number;
}

/**
 * A route segment between two points
 */
export interface RouteSegment {
  from: RoutePoint;
  to: RoutePoint;
  type: 'line' | 'curve';
}

/**
 * Options for generating manhattan routes
 */
export interface ManhattanRouteOptions {
  verticalFirst?: boolean;  // Whether to move vertically first (true) or horizontally first (false)
  minSegmentLength?: number; // Minimum length for a segment to be included
  cornerRadius?: number;     // Radius for smoothed corners (0 for sharp corners)
  levelPriority?: boolean;   // Prioritize keeping level sequences aligned
}

/**
 * Default options for manhattan routing
 */
const DEFAULT_ROUTE_OPTIONS: ManhattanRouteOptions = {
  verticalFirst: true,
  minSegmentLength: 5,
  cornerRadius: 0,
  levelPriority: true
};

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
  
  // Sort nodes by level (primary) and sequence (secondary)
  const sortedNodes = [...nodes].sort((a, b) => {
    // First sort by level
    const levelDiff = a.level - b.level;
    if (levelDiff !== 0) return levelDiff;

    // If levels are the same, try to sort by sequence_in_path if it exists
    const aSeq = a.sequence_in_path ?? 0;
    const bSeq = b.sequence_in_path ?? 0;

    if (aSeq !== bSeq) {
      return aSeq - bSeq;
    }

    // Default to x/y position for stable sorting
    const xDiff = a.x - b.x;
    return xDiff !== 0 ? xDiff : a.y - b.y;
  });

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
  // Start with a regular manhattan path
  const sharpPath = generateManhattanPath(nodes, options);
  
  // If corner radius is 0, just return the sharp path
  if (!options.cornerRadius || options.cornerRadius <= 0) {
    return sharpPath;
  }
  
  // TODO: Implement corner smoothing via SVG path arc commands
  // This is a placeholder for future enhancement
  return sharpPath;
}

/**
 * Generates a direct path between nodes (straight lines)
 */
export function generateDirectPath(nodes: LayoutNode[]): string {
  if (nodes.length < 2) return '';
  
  // Sort nodes as with other methods
  const sortedNodes = [...nodes].sort((a, b) => {
    const levelDiff = a.level - b.level;
    if (levelDiff !== 0) return levelDiff;
    
    const aSeq = a.sequence_in_path ?? 0;
    const bSeq = b.sequence_in_path ?? 0;
    
    if (aSeq !== bSeq) {
      return aSeq - bSeq;
    }
    
    const xDiff = a.x - b.x;
    return xDiff !== 0 ? xDiff : a.y - b.y;
  });
  
  // Simple direct lines
  let pathData = `M ${sortedNodes[0].x} ${sortedNodes[0].y}`;
  
  for (let i = 1; i < sortedNodes.length; i++) {
    pathData += ` L ${sortedNodes[i].x} ${sortedNodes[i].y}`;
  }
  
  return pathData;
}

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