// metroEngine.ts
import type { CareerPath, Position, PositionDetail, LayoutData, LayoutNode, LayoutPath, LayoutBounds, MetroConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { assignPathAngles, calculateNodePositions } from './nodePlacer';
import { generatePathSegments } from './pathDrawer';

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
 * Main function to generate metro map layout
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
  
  // Step 2: Calculate node positions
  let nodes = calculateNodePositions(
    positionDetails, 
    positions, 
    pathAngles,
    config
  );
  
  // Step 3: Update nodes with path colors
  const pathColorMap = new Map(careerPaths.map(p => [p.id, p.color || '#cccccc']));
  nodes = nodes.map(node => ({
    ...node,
    color: pathColorMap.get(node.careerPathId) || node.color
  }));
  
  // Step 4: Group nodes by path
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  // Step 5: Create path objects
  const paths: LayoutPath[] = careerPaths.map(path => {
    const pathNodes = nodesByPath.get(path.id) || [];
    
    return {
      id: path.id,
      name: path.name,
      color: path.color || '#cccccc',
      nodes: pathNodes.map(node => node.id)
    };
  });
  
  // Step 6: Build lookup objects
  const nodesById: Record<string, LayoutNode> = {};
  nodes.forEach(node => {
    nodesById[node.id] = node;
  });
  
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => {
    pathsById[path.id] = path;
  });
  
  // Step 7: Calculate bounds
  const bounds = calculateBounds(nodes, config.padding);
  
  // Step 8: Return layout data
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