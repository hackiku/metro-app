// src/types/engine.ts

// --- Metro Layout Configuration ---
export interface MetroConfig {
  midLevelRadius: number;
  radiusStep: number;
  minRadius: number;
  numDirections: number;
  angleOffset: number;
  eccentricity: number;
  padding: number;
  maxConsecutiveAligned?: number; // Maximum nodes in a straight line (default: 3)
}

// --- Layout Output Structures ---
export interface LayoutNode {
  id: string;
  positionId: string;
  careerPathId: string;
  level: number;
  name: string;
  x: number;
  y: number;
  color: string;
  isInterchange?: boolean;
  sequence_in_path?: number | null;
  relatedPaths?: string[]; // IDs of all paths this position appears in
}

export interface LayoutPath {
  id: string;
  name: string;
  color: string;
  nodes: string[];
}

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// For compatibility with existing components
export interface PolarGridConfig {
  layoutType: 'polarGrid';
  midLevelRadius: number;
  radiusStep: number;
  minRadius?: number;
  numAngleSteps: number;
  angleOffsetDegrees?: number;
  padding: number;
  // Add any other required fields for backward compatibility
}

export interface LayoutData {
  nodes: LayoutNode[];
  nodesById: Record<string, LayoutNode>;
  paths: LayoutPath[];
  pathsById: Record<string, LayoutPath>;
  bounds: LayoutBounds;
  configUsed: PolarGridConfig;
}

// --- Input Data Structures ---
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
  id: string;
  position_id: string;
  career_path_id: string;
  level: number;
  sequence_in_path?: number | null;
  organization_id: string;
  created_at: string;
}

// --- Helper Types ---
export interface Point {
  x: number;
  y: number;
}

export interface PolarPoint {
  radius: number;
  angleDegrees: number;
}