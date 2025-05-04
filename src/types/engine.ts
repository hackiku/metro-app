// src/types/engine.ts

// --- Metro Layout Configuration ---
export interface MetroConfig {
  midLevelRadius: number;        // Base radius for mid-level before scaling
  radiusStep: number;            // Base distance per level step before scaling
  minRadius: number;             // Base minimum radius before scaling
  globalScale: number;           // Overall scaling factor for the layout
  numDirections: number;         // Target grid directions for segment snapping (e.g., 8 for 45°)
  angleOffset: number;           // Global rotation offset for the snapping grid (degrees)
  padding: number;               // Visual padding around the layout bounds
  maxConsecutiveAligned?: number; // Max nodes in a straight line before bending (e.g., 2 or 3)
  // eccentricity: number; // Removed - No longer used
}

// --- Layout Output Structures ---
export interface LayoutNode {
  id: string;                 // Unique ID for the layout node (usually PositionDetail ID)
  positionId: string;         // ID of the Position
  careerPathId: string;       // ID of the Career Path
  level: number;              // Seniority level
  name: string;               // Name of the Position
  x: number;                  // Calculated X coordinate
  y: number;                  // Calculated Y coordinate
  color: string;              // Color inherited from the Career Path
  isInterchange?: boolean;     // True if the Position exists in multiple paths
  sequence_in_path?: number | null; // Optional sorting sequence within a path level
  relatedPaths?: string[];    // IDs of all paths this position appears in (if interchange)
  // Add calculated properties if needed later (e.g., original radius/angle)
  // initialRadius?: number;
  // initialAngle?: number;
}

export interface LayoutPath {
  id: string;
  name: string;
  color: string;
  nodes: string[]; // Array of LayoutNode IDs belonging to this path, in order
}

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Configuration structure specifically for the PolarGrid visualizer component
export interface PolarGridConfig {
  layoutType: 'polarGrid';       // Identifier for the layout type
  midLevelRadius: number;        // SCALED mid-level radius for grid display
  radiusStep: number;            // SCALED radius step for grid display
  minRadius?: number;            // SCALED minimum radius for grid display
  numAngleSteps: number;         // Number of angle lines to draw (matches config.numDirections)
  angleOffsetDegrees?: number;   // Angle offset for grid display (matches config.angleOffset)
  padding: number;               // Padding used during layout calculation
  // Add other relevant config values displayed by the grid if needed
  // globalScale?: number;
  // maxConsecutiveAligned?: number;
}

// Main data structure returned by the layout engine
export interface LayoutData {
  nodes: LayoutNode[];                    // Array of all positioned nodes
  nodesById: Record<string, LayoutNode>;  // Lookup map for nodes by their ID
  paths: LayoutPath[];                    // Array of path definitions with ordered node IDs
  pathsById: Record<string, LayoutPath>;  // Lookup map for paths by their ID
  bounds: LayoutBounds;                   // Calculated bounding box of the layout
  configUsed: PolarGridConfig;            // Configuration used, formatted for the grid display
}

// --- Input Data Structures (Matching your DB schema) ---
export interface Position {
  id: string;
  name: string;
  description?: string | null;
  organization_id: string;
  created_at: string;
}

export interface CareerPath {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  organization_id: string;
  created_at: string;
}

export interface PositionDetail {
  id: string;                 // Primary key for the relationship
  position_id: string;
  career_path_id: string;
  level: number;
  sequence_in_path?: number | null;
  organization_id: string;
  created_at: string;
}

// --- Helper Types (Optional) ---
export interface Point { x: number; y: number; }
export interface PolarPoint { radius: number; angleDegrees: number; }