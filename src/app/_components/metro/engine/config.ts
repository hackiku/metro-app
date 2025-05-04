// src/app/_components/metro/engine/config.ts

import type { MetroConfig } from '~/types/engine';

// Default configuration
export const DEFAULT_CONFIG: MetroConfig = {
  // --- Positioning & Scaling ---
  midLevelRadius: 20,       // Base radius for mid-level before scaling. Start closer.
  radiusStep: 300,           // Base distance per level step before scaling.
  minRadius: 10,            // Base minimum radius before scaling. Allow closer start.
  globalScale: 2.5,         // Overall scaling factor. Adjust as needed (e.g., 1.0, 1.5, 2.0).

  // --- Angular Grid & Constraints ---
  numDirections: 8,         // TARGET grid directions (8 = 45°, 4 = 90°). Defines final snapped angles.
  angleOffset: 0,           // Rotational offset for the final snapping grid (degrees).
  maxConsecutiveAligned: 3, // Max nodes in a straight line before bending (3 is often better than 2).
  padding: 50,              // Visual margin around the calculated layout bounds.

  // --- eccentricity: 0, // Removed - No longer used ---
};

// --- Notes ---
// globalScale: Increase to spread out, decrease to compact.
// numDirections: Enforces final segment angles (e.g., 8 => only 0, 45, 90, 135... degree segments allowed).
// maxConsecutiveAligned: Set to 2 for very strict bending, 3 allows slightly longer straight sections.