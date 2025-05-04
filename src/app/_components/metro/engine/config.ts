// src/app/_components/metro/engine/config.ts

import type { MetroConfig } from '~/types/engine';

// Default configuration
export const DEFAULT_CONFIG: MetroConfig = {
  // --- Positioning & Scaling ---
  midLevelRadius: 50,      // Target radius for mid-level positions BEFORE scaling.
  radiusStep: 100,          // Base distance unit per level step BEFORE scaling.
  minRadius: 50,           // Minimum radius from center BEFORE scaling.
  globalScale: 10.0,        // Multiplier for all radii/distances. > 1 spreads out, < 1 compacts.

  // --- Angular Grid & Constraints ---
  numDirections: 8,        // Target grid directions for segments (8 = 45° steps). This defines the final 'snap' angles.
  angleOffset: 0,          // Rotational offset for the entire final grid (degrees).
  maxConsecutiveAligned: 3,// Max nodes in a perfectly straight line before bending.
  padding: 50,             // Visual margin around the calculated layout bounds.

  // --- Initial Placement (Internal - Generally leave at 0 for grid focus) ---
  eccentricity: 0,         // Deprecated/unused in new placement logic. Set to 0.
};

// --- Notes on Config Values ---
// globalScale: Crucial for controlling overall density. Applied to midLevelRadius, radiusStep, minRadius internally.
// midLevelRadius: The conceptual center radius before scaling.
// radiusStep: How much distance one level difference makes, before scaling.
// minRadius: Closest distance to origin allowed, before scaling.
// numDirections: Determines the *final* snapped angles (0, 45, 90, etc.). Independent of the number of paths.
// angleOffset: Rotates the final snapped grid.
// maxConsecutiveAligned: Prevents visually boring long straight lines.