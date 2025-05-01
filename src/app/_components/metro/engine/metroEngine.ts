
// src/app/_components/metro/engine/metroEngine.ts

import type { CareerPath, Position, PositionDetail, LayoutData, LayoutNode, LayoutPath, LayoutBounds, MetroConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { assignPathAngles, calculateNodePositions } from './nodePlacer';
import { generatePathSegments } from './pathDrawer';
import { 
  calculateUniformPathDistances, 
  calculateRequirementBasedDistances,
  applyPathDistances,
  adjustNodeSpread
} from './pathScaler';

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
 * Identify interchange nodes (nodes that could belong to multiple paths)
 * This helps visually distinguish important stations
 */
function identifyInterchangeNodes(nodes: LayoutNode[]): LayoutNode[] {
  // Find positions that appear in multiple career paths
  const positionPaths = new Map<string, Set<string>>();
  
  // Count career paths per position
  nodes.forEach(node => {
    if (!positionPaths.has(node.positionId)) {
      positionPaths.set(node.positionId, new Set());
    }
    positionPaths.get(node.positionId)!.add(node.careerPathId);
  });
  
  // Mark nodes as interchanges if their position appears in multiple paths
  return nodes.map(node => {
    const pathCount = positionPaths.get(node.positionId)?.size || 0;
    return {
      ...node,
      isInterchange: pathCount > 1
    };
  });
}

/**
 * Main function to generate metro map layout with improved spacing and scaling
 */
export function generateMetroLayout(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[],
  config: MetroConfig = DEFAULT_CONFIG
): LayoutData {
  // Validate input
  if (!careerPaths.length || !positions.length || !positionDetails.length) {
    throw new Error('Cannot generate layout: missing required data');
  }
  
  // Step 1: Assign angles to career paths
  const pathAngles = assignPathAngles(careerPaths, config);
  
  // Step 2: Calculate initial node positions with metro-style grid alignment
  let nodes = calculateNodePositions(
    positionDetails, 
    positions, 
    pathAngles,
    config
  );
  
  // Step 3: Identify interchange nodes
  nodes = identifyInterchangeNodes(nodes);
  
  // Step 4: Calculate path distances
  // For now, use uniform distances, but this could be replaced with
  // requirement-based distances when that data is available
  const distances = calculateUniformPathDistances(nodes, config.radiusStep * 2.0);
  
  // Step 5: Apply calculated distances to adjust node positions
  nodes = applyPathDistances(nodes, distances, config);
  
  // Step 6: Adjust node spread to prevent crowding
  nodes = adjustNodeSpread(nodes, config, 1.3);
  
  // Step 7: Update nodes with path colors
  const pathColorMap = new Map(careerPaths.map(p => [p.id, p.color || '#cccccc']));
  nodes = nodes.map(node => ({
    ...node,
    color: pathColorMap.get(node.careerPathId) || node.color
  }));
  
  // Step 8: Group nodes by path
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  // Step 9: Create path objects
  const paths: LayoutPath[] = careerPaths.map(path => {
    const pathNodes = nodesByPath.get(path.id) || [];
    
    return {
      id: path.id,
      name: path.name,
      color: path.color || '#cccccc',
      nodes: pathNodes.map(node => node.id)
    };
  });
  
  // Step 10: Build lookup objects
  const nodesById: Record<string, LayoutNode> = {};
  nodes.forEach(node => {
    nodesById[node.id] = node;
  });
  
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => {
    pathsById[path.id] = path;
  });
  
  // Step 11: Calculate bounds
  const bounds = calculateBounds(nodes, config.padding);
  
  // Step 12: Return layout data
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