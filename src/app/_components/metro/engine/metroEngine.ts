// src/app/_components/metro/engine/metroEngine.ts

import type { CareerPath, Position, PositionDetail, LayoutData, LayoutNode, LayoutPath, LayoutBounds, MetroConfig, PolarGridConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';
import { assignPathAngles, calculateInitialNodePositions } from './nodePlacer';
import { enforceGridAngles, enforceLineConstraints } from './pathConstraints';
import { identifyInterchangeNodes, ensureMinimumDistance, adjustOriginNodes } from './nodeUtils';

function calculateBounds(nodes: LayoutNode[], padding: number): LayoutBounds {
  if (nodes.length === 0) return { minX: -padding, maxX: padding, minY: -padding, maxY: padding };
  let minX = nodes[0].x, maxX = nodes[0].x, minY = nodes[0].y, maxY = nodes[0].y;
  nodes.forEach(node => { minX = Math.min(minX, node.x); maxX = Math.max(maxX, node.x); minY = Math.min(minY, node.y); maxY = Math.max(maxY, node.y); });
  return { minX: minX - padding, maxX: maxX + padding, minY: minY - padding, maxY: maxY + padding };
}

function applyPathColors(nodes: LayoutNode[], careerPaths: CareerPath[]): LayoutNode[] {
  const pathColorMap = new Map(careerPaths.map(p => [p.id, p.color || '#cccccc']));
  return nodes.map(node => ({ ...node, color: pathColorMap.get(node.careerPathId) || '#cccccc' }));
}

function sortPathNodes(nodes: LayoutNode[]): Map<string, LayoutNode[]> {
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => { if (!nodesByPath.has(node.careerPathId)) nodesByPath.set(node.careerPathId, []); nodesByPath.get(node.careerPathId)!.push(node); });
  nodesByPath.forEach((pathNodes) => {
    pathNodes.sort((a, b) => {
      const levelDiff = a.level - b.level; if (levelDiff !== 0) return levelDiff;
      if (a.sequence_in_path != null && b.sequence_in_path != null) return a.sequence_in_path - b.sequence_in_path;
      return 0;
    });
  }); return nodesByPath;
}

function buildLookups(nodes: LayoutNode[], paths: LayoutPath[]): { nodesById: Record<string, LayoutNode>; pathsById: Record<string, LayoutPath>; } {
  const nodesById: Record<string, LayoutNode> = {}; nodes.forEach(node => { nodesById[node.id] = node; });
  const pathsById: Record<string, LayoutPath> = {}; paths.forEach(path => { pathsById[path.id] = path; });
  return { nodesById, pathsById };
}

export function generateMetroLayout(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutData {
  // console.log("--- Metro Layout Generation Start ---");
  // console.log("Using config:", config);

   if (!careerPaths?.length || !positions?.length || !positionDetails?.length) {
     console.error('MetroEngine: Missing required data.', { numPaths: careerPaths?.length, numPos: positions?.length, numDetails: positionDetails?.length });
     return { nodes: [], nodesById: {}, paths: [], pathsById: {}, bounds: { minX: -50, maxX: 50, minY: -50, maxY: 50 }, configUsed: { layoutType: 'polarGrid', midLevelRadius: config.midLevelRadius, radiusStep: config.radiusStep, minRadius: config.minRadius, numAngleSteps: config.numDirections, angleOffsetDegrees: config.angleOffset, padding: config.padding }};
   }
   const numActualPaths = careerPaths.length;
   // console.log(`Processing ${numActualPaths} career paths.`);

  const scale = config.globalScale;
  const scaledMinRadius = config.minRadius * scale;
  const scaledNodeSeparation = (config.radiusStep * 0.25) * scale; // Min separation based on scaled step

  const pathAngles = assignPathAngles(careerPaths, config);
  // console.log(`Step 1: Assigned initial angles for ${numActualPaths} paths.`);

  let nodes = calculateInitialNodePositions(positionDetails, positions, pathAngles, config);
  // console.log(`Step 2: Calculated Initial Positions for ${nodes.length} nodes.`);

  nodes = adjustOriginNodes(nodes, scaledMinRadius);
  // console.log(`Step 3: Adjusted nodes near origin (min dist: ${scaledMinRadius.toFixed(1)}).`);

  // --- Run Grid Enforcement Multiple Times? Optional but can help settle ---
  nodes = enforceGridAngles(nodes, config); // First Pass
  // console.log(`Step 4a: Enforced segment angles (Pass 1).`);
  // nodes = ensureMinimumDistance(nodes, scaledNodeSeparation * 0.5, 10); // Gentle separation between passes?
  // nodes = enforceGridAngles(nodes, config); // Second Pass
  // console.log(`Step 4b: Enforced segment angles (Pass 2).`);
  // --- End Optional Multi-Pass ---

  nodes = enforceLineConstraints(nodes, config);
  // console.log("Step 5: Enforced line constraints (bends).");

  nodes = ensureMinimumDistance(nodes, scaledNodeSeparation, 40); // Final separation, more iterations
  // console.log(`Step 6: Ensured minimum node distance (~${scaledNodeSeparation.toFixed(1)}).`);

  // --- Post-processing ---
  nodes = identifyInterchangeNodes(nodes);
  // console.log("Step 7: Identified interchange nodes.");
  nodes = applyPathColors(nodes, careerPaths);
  // console.log("Step 8: Applied path colors.");
  const nodesByPath = sortPathNodes(nodes);
  // console.log("Step 9: Grouped and sorted nodes by path.");

  const paths: LayoutPath[] = careerPaths.map(path => ({
    id: path.id, name: path.name, color: path.color || '#cccccc',
    nodes: (nodesByPath.get(path.id) || []).map(node => node.id)
  }));
  // console.log(`Step 10: Created ${paths.length} final path objects.`);

  const { nodesById, pathsById } = buildLookups(nodes, paths);
  // console.log("Step 11: Built lookup tables.");
  const bounds = calculateBounds(nodes, config.padding * scale);
  // console.log("Step 12: Calculated layout bounds:", bounds);
  // console.log("--- Metro Layout Generation Complete ---");

  const configUsed: PolarGridConfig = {
      layoutType: 'polarGrid',
      midLevelRadius: config.midLevelRadius * scale,
      radiusStep: config.radiusStep * scale,
      minRadius: scaledMinRadius,
      numAngleSteps: config.numDirections,
      angleOffsetDegrees: config.angleOffset,
      padding: config.padding,
  };

  return { nodes, nodesById, paths, pathsById, bounds, configUsed };
}