// src/app/_components/metro/engine/metroEngine.ts

import type { CareerPath, Position, PositionDetail, LayoutData, LayoutNode, LayoutPath, LayoutBounds, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';
import { assignPathAngles, calculateInitialNodePositions } from './nodePlacer';
import { enforceGridAngles, enforceLineConstraints } from './pathConstraints';
import { identifyInterchangeNodes, ensureMinimumDistance, adjustOriginNodes } from './nodeUtils'; // Removed applySubtleJitter call previously

// calculateBounds, applyPathColors, sortPathNodes, buildLookups remain unchanged

/** Calculate bounds (unchanged) */
function calculateBounds(nodes: LayoutNode[], padding: number): LayoutBounds { /* ... as before ... */
  if (nodes.length === 0) return { minX: -padding, maxX: padding, minY: -padding, maxY: padding };
  let minX = nodes[0].x, maxX = nodes[0].x, minY = nodes[0].y, maxY = nodes[0].y;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x); maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y); maxY = Math.max(maxY, node.y);
  });
  return { minX: minX - padding, maxX: maxX + padding, minY: minY - padding, maxY: maxY + padding };
}
/** Apply colors (unchanged) */
function applyPathColors(nodes: LayoutNode[], careerPaths: CareerPath[]): LayoutNode[] { /* ... as before ... */
  const pathColorMap = new Map(careerPaths.map(p => [p.id, p.color || '#cccccc']));
  return nodes.map(node => ({ ...node, color: pathColorMap.get(node.careerPathId) || '#cccccc' }));
}
/** Sort nodes (unchanged) */
function sortPathNodes(nodes: LayoutNode[]): Map<string, LayoutNode[]> { /* ... as before ... */
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) nodesByPath.set(node.careerPathId, []);
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  nodesByPath.forEach((pathNodes) => {
    pathNodes.sort((a, b) => {
      const levelDiff = a.level - b.level; if (levelDiff !== 0) return levelDiff;
      if (a.sequence_in_path != null && b.sequence_in_path != null) return a.sequence_in_path - b.sequence_in_path;
      return 0;
    });
  }); return nodesByPath;
}
/** Build lookups (unchanged) */
function buildLookups(nodes: LayoutNode[], paths: LayoutPath[]): { nodesById: Record<string, LayoutNode>; pathsById: Record<string, LayoutPath>; } { /* ... as before ... */
  const nodesById: Record<string, LayoutNode> = {}; nodes.forEach(node => { nodesById[node.id] = node; });
  const pathsById: Record<string, LayoutPath> = {}; paths.forEach(path => { pathsById[path.id] = path; });
  return { nodesById, pathsById };
}


/**
 * Main function to generate metro map layout with scale and adaptive angles.
 */
export function generateMetroLayout(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutData {
  console.log("--- Metro Layout Generation Start ---");
  console.log("Using config:", config);

  // --- Input Validation ---
   if (!careerPaths?.length || !positions?.length || !positionDetails?.length) {
     console.error('MetroEngine: Missing required data.', { numPaths: careerPaths?.length, numPos: positions?.length, numDetails: positionDetails?.length });
     // Return empty layout
     return { nodes: [], nodesById: {}, paths: [], pathsById: {}, bounds: { minX: -50, maxX: 50, minY: -50, maxY: 50 }, configUsed: { layoutType: 'polarGrid', ...config, numAngleSteps: config.numDirections, angleOffsetDegrees: config.angleOffset }};
   }
   const numActualPaths = careerPaths.length;
   console.log(`Processing ${numActualPaths} career paths.`);

  // --- Apply Scaling ---
  const scale = config.globalScale;
  const scaledMinRadius = config.minRadius * scale;
  // Define a reasonable minimum distance based on scaled radius step
  const scaledNodeSeparation = (config.radiusStep * 0.25) * scale; // e.g., 25% of scaled step size

  // --- Layout Steps ---

  // Step 1: Assign initial path angles based on the ACTUAL number of paths
  const pathAngles = assignPathAngles(careerPaths, config);
  console.log(`Step 1: Assigned initial angles for ${numActualPaths} paths.`);

  // Step 2: Calculate initial positions, applying scale internally
  let nodes = calculateInitialNodePositions(positionDetails, positions, pathAngles, config);
  console.log(`Step 2: Calculated Initial Positions for ${nodes.length} nodes.`);

  // Step 3: Adjust nodes near origin (use scaled min radius)
  nodes = adjustOriginNodes(nodes, scaledMinRadius);
  console.log(`Step 3: Adjusted nodes near origin (min dist: ${scaledMinRadius.toFixed(1)}).`);

  // Step 4: Enforce PRECISE grid angles between segments (using config.numDirections)
  nodes = enforceGridAngles(nodes, config);
  console.log(`Step 4: Enforced segment angles to ${config.numDirections}-direction grid.`);

  // Step 5: Enforce line constraints (break long straight lines, applies scale internally)
  nodes = enforceLineConstraints(nodes, config);
  console.log("Step 5: Enforced line constraints (bends).");

  // Step 6: Ensure minimum distance between ALL nodes (use scaled separation)
  nodes = ensureMinimumDistance(nodes, scaledNodeSeparation, 30); // More iterations
  console.log(`Step 6: Ensured minimum node distance (~${scaledNodeSeparation.toFixed(1)}).`);

  // Step 7: Identify interchange nodes
  nodes = identifyInterchangeNodes(nodes);
  console.log("Step 7: Identified interchange nodes.");

  // Step 8: Apply path colors
  nodes = applyPathColors(nodes, careerPaths);
  console.log("Step 8: Applied path colors.");

  // Step 9: Final sort for path construction
  const nodesByPath = sortPathNodes(nodes);
  console.log("Step 9: Grouped and sorted nodes by path.");

  // Step 10: Create final path objects
  const paths: LayoutPath[] = careerPaths.map(path => ({
    id: path.id, name: path.name, color: path.color || '#cccccc',
    nodes: (nodesByPath.get(path.id) || []).map(node => node.id)
  }));
  console.log(`Step 10: Created ${paths.length} final path objects.`);

  // Step 11: Build lookup objects
  const { nodesById, pathsById } = buildLookups(nodes, paths);
  console.log("Step 11: Built lookup tables.");

  // Step 12: Calculate final layout bounds (applies padding)
  const bounds = calculateBounds(nodes, config.padding * scale); // Scale padding too? Optional.
  console.log("Step 12: Calculated layout bounds:", bounds);

  console.log("--- Metro Layout Generation Complete ---");

  // Step 13: Return layout data, including config for the PolarGrid visualizer
  return {
    nodes, nodesById, paths, pathsById, bounds,
    configUsed: { // Adapt MetroConfig to PolarGridConfig structure
      layoutType: 'polarGrid',
      midLevelRadius: config.midLevelRadius * scale, // Pass scaled value
      radiusStep: config.radiusStep * scale,       // Pass scaled value
      minRadius: scaledMinRadius,                   // Pass scaled value
      numAngleSteps: config.numDirections, // Grid uses snapping directions
      angleOffsetDegrees: config.angleOffset,
      padding: config.padding,
      // Add other fields if PolarGrid needs them
    }
  };
}