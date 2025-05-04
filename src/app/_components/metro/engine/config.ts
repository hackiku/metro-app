// src/app/_components/metro/engine/config.ts

import type { MetroConfig } from '~/types/engine';

// Default configuration with sensible values
export const DEFAULT_CONFIG: MetroConfig = {
  midLevelRadius: 50,     // Target radius for mid-level positions
  radiusStep: 150,         // Base unit for distance calculation
  minRadius: 150,          // Minimum radius from center
  numDirections: 8,       // How many angle directions (8 = 45° steps)
  angleOffset: 0,         // Offset by half a step to avoid perfect horizontal/vertical
  eccentricity: 0.0,      // Moderate asymmetry (0-1)
  padding: 0,            // Margin around the layout bounds
  maxConsecutiveAligned: 1 // Maximum nodes in a straight line
};