// src/app/_components/metro/engine/nodePlacer.ts

import type { CareerPath, PositionDetail, Position, LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
* Generates a simple hash from a string to create deterministic variations
* Used to add natural-looking variations to node positions
* @param str Input string to hash
* @returns A value between 0-99
*/
function simpleHash(str: string): number {
   let hash = 0;
   for (let i = 0; i < str.length; i++) {
       const char = str.charCodeAt(i);
       hash = ((hash << 5) - hash) + char; // Bitwise left shift and subtraction
       hash |= 0; // Convert to 32bit integer via bitwise OR with 0
   }
   return Math.abs(hash % 100); // Ensure positive value between 0-99
}

/**
* Assigns each career path an angle around the circle
* This determines which direction the path will extend from the center
* @param paths Array of career paths to position
* @param config Metro layout configuration
* @returns Map of path IDs to their assigned angles in degrees
*/
export function assignPathAngles(
 paths: CareerPath[],
 config: MetroConfig = DEFAULT_CONFIG
): Map<string, number> {
 const pathAngles = new Map<string, number>();
 const numPaths = paths.length;
 if (numPaths === 0) return pathAngles;
 
 // Sort paths for consistent ordering between renders
 const sortedPaths = [...paths].sort((a, b) => a.id.localeCompare(b.id));
 
 // Divide the 360° circle evenly among all paths
 const angleStep = 360 / numPaths;
 
 sortedPaths.forEach((path, index) => {
   // Calculate base angle based on path's position in sorted array
   const baseAngle = (index * angleStep);
   // Apply the configured offset and normalize to 0-360°
   const finalAngle = (baseAngle + config.angleOffset) % 360;
   pathAngles.set(path.id, finalAngle);
 });
 
 return pathAngles;
}

/**
* Analyzes position details to extract level information for each path
* This helps determine radius scaling based on seniority levels
* @param details Array of position details to analyze
* @returns Object containing global level ranges and per-path level information
*/
export function getPathLevelInfo(details: PositionDetail[]): {
 globalMinLevel: number;
 globalMaxLevel: number;
 globalMidLevel: number;
 pathLevels: Map<string, {min: number, max: number, mid: number, count: number}>;
} {
   // Handle empty input case
   if (details.length === 0) return { 
       globalMinLevel: 1, globalMaxLevel: 1, globalMidLevel: 1, pathLevels: new Map() 
   };
   
   // Calculate global level range across all paths
   const levels = details.map(d => d.level);
   const globalMinLevel = Math.min(...levels); 
   const globalMaxLevel = Math.max(...levels);
   const globalMidLevel = (globalMinLevel + globalMaxLevel) / 2;
   
   // Group position details by career path
   const detailsByPath = new Map<string, PositionDetail[]>();
   details.forEach(detail => { 
       if (!detailsByPath.has(detail.career_path_id)) 
           detailsByPath.set(detail.career_path_id, []); 
       detailsByPath.get(detail.career_path_id)!.push(detail); 
   });
   
   // Calculate level information for each path
   const pathLevels = new Map<string, {min: number, max: number, mid: number, count: number}>();
   detailsByPath.forEach((pathDetails, pathId) => { 
       const pathLevelList = pathDetails.map(d => d.level); 
       const min = Math.min(...pathLevelList); 
       const max = Math.max(...pathLevelList); 
       const mid = (min + max) / 2; 
       pathLevels.set(pathId, { min, max, mid, count: pathDetails.length }); 
   });
   
   return { globalMinLevel, globalMaxLevel, globalMidLevel, pathLevels };
}

/**
* Converts angle in degrees to a unit direction vector
* Used to determine node placement direction from center
* @param angle Angle in degrees
* @returns Direction vector with dx, dy components
*/
function getPolarVector(angle: number): { dx: number, dy: number } {
 const radians = (angle * Math.PI) / 180;
 return { dx: Math.cos(radians), dy: Math.sin(radians) };
}

/**
* Calculates initial positions for all nodes in the metro map
* Places nodes along radial paths based on their level and path
* @param details Position details containing level and path information
* @param positions Base position data with names and metadata
* @param pathAngles Map of path IDs to their assigned angles
* @param config Metro layout configuration
* @returns Array of layout nodes with calculated x,y coordinates
*/
export function calculateInitialNodePositions(
 details: PositionDetail[],
 positions: Position[],
 pathAngles: Map<string, number>,
 config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
 // Create lookup map for position data
 const posMap = new Map(positions.map(p => [p.id, p]));
 
 // Get level information for proper scaling
 const levelInfo = getPathLevelInfo(details);

 // Apply global scaling to all measurements
 const scale = config.globalScale;
 const scaledMidRadius = config.midLevelRadius * scale;
 const scaledRadiusStep = config.radiusStep * scale;
 const scaledMinRadius = config.minRadius * scale;
 
 // Group details by career path for processing
 const pathDetails = new Map<string, PositionDetail[]>();
 details.forEach(detail => { 
   if (!pathDetails.has(detail.career_path_id)) 
       pathDetails.set(detail.career_path_id, []); 
   pathDetails.get(detail.career_path_id)!.push(detail); 
 });

 // Sort nodes within each path by level and sequence
 pathDetails.forEach((pathNodes) => {
   pathNodes.sort((a, b) => {
     // First sort by level (seniority)
     const levelDiff = a.level - b.level;
     if (levelDiff !== 0) return levelDiff;
     // Then by sequence within level if available
     if (a.sequence_in_path != null && b.sequence_in_path != null) {
       return a.sequence_in_path - b.sequence_in_path;
     }
     return 0;
   });
 });

 const nodes: LayoutNode[] = [];
 // Controls amount of random variation in node placement
 const nodeVariationFactor = 0.20; 

 // Process each path to position its nodes
 pathDetails.forEach((pathNodes, pathId) => {
   if (pathNodes.length === 0) return;
   
   // Get this path's angle and level information
   const initialPathAngle = pathAngles.get(pathId) ?? 0;
   const pathLevelInfo = levelInfo.pathLevels.get(pathId);
   if (!pathLevelInfo) return;

   // Get direction vectors for junior and senior positions
   const mainVector = getPolarVector(initialPathAngle);
   const oppositeVector = getPolarVector((initialPathAngle + 180) % 360);

   // Process each node on this path
   pathNodes.forEach((detail) => {
     const position = posMap.get(detail.position_id);
     if (!position) return;

     // Determine if this is a senior-level position
     const isSeniorNode = detail.level > pathLevelInfo.mid;
     // Senior positions extend in opposite direction from juniors
     const directionVector = isSeniorNode ? oppositeVector : mainVector;

     // Start with the mid-level radius
     let radius = scaledMidRadius;
     
     // Calculate how far from mid-level this position is
     const levelDiff = Math.abs(detail.level - pathLevelInfo.mid);
     // Find the maximum possible level difference for this path
     const pathMaxDeviation = Math.max(
       pathLevelInfo.mid - pathLevelInfo.min, 
       pathLevelInfo.max - pathLevelInfo.mid, 
       0.5 // Minimum to avoid division by zero
     );

     // Scale radius based on level difference
     if (pathMaxDeviation > 0 && levelDiff > 0) {
       const normalizedDiff = levelDiff / pathMaxDeviation;
       radius += normalizedDiff * scaledRadiusStep;
     }

     // Add slight random variation for natural-looking placement
     const variationHash = simpleHash(detail.id);
     const radiusVariation = (variationHash / 50 - 1) * scaledRadiusStep * nodeVariationFactor;
     radius += radiusVariation;

     // Ensure radius is not smaller than minimum
     radius = Math.max(radius, scaledMinRadius);

     // Calculate final x,y coordinates using direction vector and radius
     const x = directionVector.dx * radius;
     const y = directionVector.dy * radius;

     // Create the node with calculated position
     nodes.push({
       id: detail.id, 
       positionId: detail.position_id, 
       careerPathId: detail.career_path_id,
       level: detail.level, 
       name: position.name, 
       x, 
       y,
       color: "#cccccc", // Default color, will be updated later
       sequence_in_path: detail.sequence_in_path, 
       isInterchange: false, // Will be identified in later processing
     });
   });
 });
 
 return nodes;
}