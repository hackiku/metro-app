// src/app/_components/metro/engine/config.ts

import type { MetroConfig } from './types';

// Default configuration with sensible values
export const DEFAULT_CONFIG: MetroConfig = {
  midLevelRadius: 250,     // Target radius for mid-level positions
  radiusStep: 170,          // Base unit for distance calculation
  minRadius: -100,          // Minimum radius from center
  numDirections: 8,        // How many angle directions (8 = 45° steps)
  angleOffset: 22.5,       // Offset by half a step to avoid perfect horizontal/vertical
  eccentricity: 0.9,       // Moderate asymmetry
  padding: 50              // Margin around the layout bounds
};