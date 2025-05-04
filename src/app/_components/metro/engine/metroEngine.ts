// src/app/_components/metro/engine/metroEngine.ts

import type { CareerPath, Position, PositionDetail, LayoutData, LayoutNode, LayoutPath, LayoutBounds, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';
import { assignPathAngles, calculateInitialNodePositions } from './nodePlacer';
import { enforceLineConstraints } from './pathConstraints';
import { identifyInterchangeNodes } from './nodeUtils';

/**
 * Calculates layout bounds with padding
 */
function calculateBounds(nodes: LayoutNode[], padding: number): LayoutBounds {
  if (nodes.length === 0) {
    return { minX: -padding, maxX: padding, minY: -padding, maxY: padding };
  }
  
  // Find extremes
  let minX = nodes[0].x;
  let maxX = nodes[0].x;
  let minY = nodes[0].y;
  let maxY = nodes[0].y;
  
  for (let i = 1; i < nodes.length; i++) {
    minX = Math.min(minX, nodes[i].x);
    maxX = Math.max(maxX, nodes[i].x);
    minY = Math.min(minY, nodes[i].y);
    maxY = Math.max(maxY, nodes[i].y);
  }
  
  // Add padding
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
  };
}

/**
 * Apply colors from career paths to nodes
 */
function applyPathColors(nodes: LayoutNode[], careerPaths: CareerPath[]): LayoutNode[] {
  const pathColorMap = new Map(careerPaths.map(p => [p.id, p.color || '#cccccc']));
  
  return nodes.map(node => ({
    ...node,
    color: pathColorMap.get(node.careerPathId) || '#cccccc'
  }));
}

/**
 * Sort nodes within each path by level and sequence
 */
function sortPathNodes(nodes: LayoutNode[]): Map<string, LayoutNode[]> {
  // Group nodes by path
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  // Sort nodes within each path
  nodesByPath.forEach((pathNodes, pathId) => {
    pathNodes.sort((a, b) => {
      // First sort by level
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      
      // Then by sequence if available
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      
      return 0;
    });
  });
  
  return nodesByPath;
}

/**
 * Build lookup structures for efficient access
 */
function buildLookups(nodes: LayoutNode[], paths: LayoutPath[]): {
  nodesById: Record<string, LayoutNode>;
  pathsById: Record<string, LayoutPath>;
} {
  const nodesById: Record<string, LayoutNode> = {};
  nodes.forEach(node => { nodesById[node.id] = node; });
  
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => { pathsById[path.id] = path; });
  
  return { nodesById, pathsById };
}

/**
 * Main function to generate metro map layout
 */
export function generateMetroLayout(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutData {
  console.log("Generating metro layout with config:", config);
  
  // Validate input
  if (!careerPaths.length || !positions.length || !positionDetails.length) {
    throw new Error('Cannot generate layout: missing required data');
  }
  
  // Step 1: Assign angles to career paths
  const pathAngles = assignPathAngles(careerPaths, config);
  console.log("Path angles assigned:", Object.fromEntries(pathAngles.entries()));
  
  // Step 2: Calculate initial node positions with bidirectional extension
  let nodes = calculateInitialNodePositions(
    positionDetails, 
    positions, 
    pathAngles,
    config
  );
  console.log(`Initial node positions calculated: ${nodes.length} nodes`);
  
  // Step 3: Enforce constraints for consecutive nodes
  nodes = enforceLineConstraints(nodes, config);
  console.log("Line constraints enforced");
  
  // Step 4: Identify interchange nodes (positions that appear in multiple paths)
  nodes = identifyInterchangeNodes(nodes);
  console.log("Interchange nodes identified");
  
  // Step 5: Apply path colors to nodes
  nodes = applyPathColors(nodes, careerPaths);
  
  // Step 6: Group and sort nodes by path
  const nodesByPath = sortPathNodes(nodes);
  
  // Step 7: Create path objects
  const paths: LayoutPath[] = careerPaths.map(path => {
    const pathNodes = nodesByPath.get(path.id) || [];
    
    return {
      id: path.id,
      name: path.name,
      color: path.color || '#cccccc',
      nodes: pathNodes.map(node => node.id)
    };
  });
  
  // Step 8: Build lookup objects
  const { nodesById, pathsById } = buildLookups(nodes, paths);
  
  // Step 9: Calculate bounds
  const bounds = calculateBounds(nodes, config.padding);
  console.log("Layout bounds:", bounds);
  
  // Step 10: Return layout data
  return {
    nodes,
    nodesById,
    paths,
    pathsById,
    bounds,
    configUsed: {
      layoutType: 'polarGrid',
      midLevelRadius: config.midLevelRadius,
      radiusStep: config.radiusStep,
      minRadius: config.minRadius,
      numAngleSteps: config.numDirections,
      angleOffsetDegrees: config.angleOffset,
      padding: config.padding
    }
  };
}