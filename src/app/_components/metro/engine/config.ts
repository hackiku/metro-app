// src/app/_components/metro/engine/config.ts

import type { MetroConfig } from './types';

// Default configuration with sensible values
export const DEFAULT_CONFIG: MetroConfig = {
  midLevelRadius: 50,     // Target radius for mid-level positions
  radiusStep: 50,          // Base unit for distance calculation
  minRadius: 10,          // Minimum radius from center
  numDirections: 6,        // How many angle directions (8 = 45° steps)
  angleOffset: 0,       // Offset by half a step to avoid perfect horizontal/vertical
  eccentricity: 0.5,       // Moderate asymmetry
  padding: 50              // Margin around the layout bounds
};