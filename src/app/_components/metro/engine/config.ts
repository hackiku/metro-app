// src/app/_components/metro/engine/config.ts

/**
 * Grid layout configuration options
 */
export interface GridLayoutConfig {
  cellWidth: number;        // Width of grid cells
  cellHeight: number;       // Height of grid cells
  xPadding: number;         // Padding around the edges (X)
  yPadding: number;         // Padding around the edges (Y)
  levelMultiplier: number;  // How much levels affect vertical position
  domainSpread: number;     // How far apart career paths are horizontally
  centerWeight: number;     // How strongly to pull interchange nodes to center
  routingMode?: 'direct' | 'manhattan' | 'smooth'; // How paths are drawn
}

/**
 * Default grid config with sensible defaults
 */
export const DEFAULT_GRID_CONFIG: GridLayoutConfig = {
  cellWidth: 100,
  cellHeight: 80,
  xPadding: 40,
  yPadding: 40,
  levelMultiplier: 1.2,  // Higher values = more vertical spread
  domainSpread: 2.0,     // Higher values = more horizontal spread
  centerWeight: 0.7,     // How much to pull common nodes toward center
  routingMode: 'manhattan'
};

/**
 * Manhattan route configuration options
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
export const DEFAULT_ROUTE_OPTIONS: ManhattanRouteOptions = {
  verticalFirst: true,
  minSegmentLength: 5,
  cornerRadius: 0,
  levelPriority: true
};