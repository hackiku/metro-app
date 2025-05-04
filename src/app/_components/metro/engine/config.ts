// src/app/_components/metro/engine/config.ts

import type { MetroConfig } from '~/types/engine';

// Default configuration with sensible values
export const DEFAULT_CONFIG: MetroConfig = {
  midLevelRadius: 50,     // Target radius for mid-level positions
  radiusStep: 200,         // Base unit for distance calculation
  minRadius: 50,          // Minimum radius from center
  numDirections: 5,       // How many angle directions (8 = 45° steps)
  angleOffset: 0,         // Offset by half a step to avoid perfect horizontal/vertical
  eccentricity: 0.0,      // Moderate asymmetry (0-1)
  padding: 50,            // Margin around the layout bounds
  maxConsecutiveAligned: 3 // Maximum nodes in a straight line
};