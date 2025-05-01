// src/app/_components/metro/engine/config.ts
export interface MetroConfig {
  // Core positioning
  baseRadius: number;        // Outer radius where junior positions start
  centerRadius: number;      // Target radius for mid-level positions
  radiusStep: number;        // Base unit for distance calculation
  
  // Path distribution
  numDirections: number;     // How many angle directions to use (typically 8 for 45° steps)
  angleOffset: number;       // Optional rotation of the entire system (in degrees)
  eccentricity: number;      // 0-1 value controlling path distribution asymmetry
  
  // Layout parameters
  padding: number;           // Margin around the layout bounds
  organicFactor: number;     // 0-1 value controlling how "organic" the spacing between nodes appears
}

// Default configuration with sensible values
export const DEFAULT_CONFIG: MetroConfig = {
  baseRadius: 350,           // Start junior positions here
  centerRadius: 150,         // Target for mid-level positions
  radiusStep: 50,            // Base unit for distance adjustments
  numDirections: 8,
  angleOffset: 22.5,         // Offset by half a step to avoid perfect horizontal/vertical
  eccentricity: 0.3,         // Moderate asymmetry
  padding: 50,
  organicFactor: 0.25        // Slight organic spacing
};