// src/app/_components/metro/engine/gridLayoutEngine.ts
import type { CareerPath, Position, PositionDetail } from '~/types/compass';
import type { LayoutNode, LayoutPath, LayoutData } from './types';
import { GridLayoutConfig, DEFAULT_GRID_CONFIG } from './config';
import { calculateCentrality, calculateLevelRanges, groupDetailsByPath, sortPathNodes } from './calculations';

/**
 * Generates a Manhattan-style grid layout for career paths
 * 
 * @param careerPaths - Array of career paths 
 * @param positionDetails - Array of position details
 * @param positions - Array of positions
 * @param config - Optional layout configuration
 * @returns Complete layout data ready for visualization
 */
export function generateGridLayout(
  careerPaths: CareerPath[],
  positionDetails: PositionDetail[],
  positions: Position[],
  config: Partial<GridLayoutConfig> = {}
): LayoutData {
  // Merge configs
  const gridConfig = { ...DEFAULT_GRID_CONFIG, ...config };
  
  // Create position lookup map for quick reference
  const positionMap = new Map(positions.map(p => [p.id, p]));
  
  // Calculate node centrality (which positions appear in multiple paths)
  const centralityScores = calculateCentrality(positionDetails);
  
  // Group details by path for processing
  const detailsByPath = groupDetailsByPath(positionDetails);
  
  // Calculate paths by position for interchange detection
  const pathsByPosition = new Map<string, string[]>();
  positionDetails.forEach(detail => {
    if (!pathsByPosition.has(detail.position_id)) {
      pathsByPosition.set(detail.position_id, []);
    }
    pathsByPosition.get(detail.position_id)?.push(detail.career_path_id);
  });
  
  // Find min and max levels to establish vertical space
  const levelRanges = calculateLevelRanges(positionDetails);
  const { min: minLevel, max: maxLevel, mid: midLevel } = levelRanges;
  
  // Sort paths by size (larger paths first) for better lane allocation
  const sortedPaths = [...careerPaths].sort((a, b) => {
    const pathASize = detailsByPath.get(a.id)?.length || 0;
    const pathBSize = detailsByPath.get(b.id)?.length || 0;
    return pathBSize - pathASize; 
  });
  
  // Assign horizontal lanes to paths - distributed around center point
  const pathLanes = new Map<string, number>();
  const pathCount = sortedPaths.length;
  
  // Calculate starting positions in four quadrants
  const quadrants = [
    { x: -1, y: -1 }, // Top left
    { x: 1, y: -1 },  // Top right
    { x: -1, y: 1 },  // Bottom left
    { x: 1, y: 1 }    // Bottom right
  ];
  
  // Assign lanes from center outward with alternating directions
  sortedPaths.forEach((path, index) => {
    // Calculate quadrant-based positioning
    const quadrantIndex = index % quadrants.length;
    const quadrant = quadrants[quadrantIndex];
    
    // Calculate lane position - distribute evenly within quadrants
    const laneIndex = Math.floor(index / quadrants.length);
    const lanesPerQuadrant = Math.ceil(pathCount / quadrants.length);
    const quadrantOffset = (laneIndex + 1) / (lanesPerQuadrant + 1);
    
    // Apply quadrant direction and offset
    const lane = quadrant.x * quadrantOffset * 2;
    
    pathLanes.set(path.id, lane);
  });
  
  // Now create nodes with grid coordinates
  const nodes: LayoutNode[] = [];
  const nodesById: Record<string, LayoutNode> = {};
  
  positionDetails.forEach(detail => {
    const position = positionMap.get(detail.position_id);
    if (!position) return;
    
    const pathLane = pathLanes.get(detail.career_path_id) || 0;
    
    // Calculate base coordinates
    // X coordinate based on path lane, centered at 0
    const baseX = pathLane * gridConfig.cellWidth * gridConfig.domainSpread;
    
    // Y coordinate based on level (distance from midLevel)
    // The mid-level positions will be at y≈0, higher levels above, lower levels below
    const levelOffset = midLevel - detail.level;
    const baseY = levelOffset * gridConfig.cellHeight * gridConfig.levelMultiplier;
    
    // Apply centering adjustment for interchanges
    const paths = pathsByPosition.get(detail.position_id) || [];
    const isInterchange = paths.length > 1;
    
    // If it's an interchange, pull it toward center
    let adjustedX = baseX;
    if (isInterchange) {
      // Calculate weighted average lane position for centering
      const totalWeight = paths.reduce((sum, pathId) => {
        const pathSize = detailsByPath.get(pathId)?.length || 0;
        return sum + Math.log(pathSize + 1); // Logarithmic scaling
      }, 0);
      
      let weightedX = 0;
      paths.forEach(pathId => {
        const pathSize = detailsByPath.get(pathId)?.length || 0;
        const pathWeight = Math.log(pathSize + 1) / totalWeight;
        const lane = pathLanes.get(pathId) || 0;
        weightedX += pathWeight * lane * gridConfig.cellWidth * gridConfig.domainSpread;
      });
      
      // Pull toward weighted position based on centerWeight
      adjustedX = baseX * (1 - gridConfig.centerWeight) + weightedX * gridConfig.centerWeight;
    }
    
    // Apply subtle jitter to prevent perfect overlaps
    const jitterFactor = 0.05;
    const jitterX = (Math.random() - 0.5) * jitterFactor * gridConfig.cellWidth;
    const jitterY = (Math.random() - 0.5) * jitterFactor * gridConfig.cellHeight;
    
    // Create node with calculated position
    const node: LayoutNode = {
      id: detail.id,
      positionId: detail.position_id,
      careerPathId: detail.career_path_id,
      level: detail.level,
      name: position.name,
      x: adjustedX + jitterX,
      y: baseY + jitterY,
      color: careerPaths.find(p => p.id === detail.career_path_id)?.color || '#cccccc',
      isInterchange: isInterchange,
      relatedPaths: paths,
      sequence_in_path: detail.sequence_in_path
    };
    
    nodes.push(node);
    nodesById[node.id] = node;
  });
  
  // Create path objects
  const paths = sortedPaths.map(path => {
    // Get and sort nodes for this path
    const pathNodes = nodes
      .filter(n => n.careerPathId === path.id)
      .sort((a, b) => a.level - b.level) // Sort by level
      .map(n => n.id);
    
    return {
      id: path.id,
      name: path.name,
      color: path.color || '#cccccc',
      nodes: pathNodes
    };
  });
  
  // Build pathsById lookup
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => {
    pathsById[path.id] = path;
  });
  
  // Calculate bounds
  const bounds = calculateBounds(nodes, gridConfig.xPadding, gridConfig.yPadding);
  
  // Return complete layout data
  return {
    nodes,
    nodesById,
    paths,
    pathsById,
    bounds,
    configUsed: gridConfig
  };
}

/**
 * Calculate the bounding box for all nodes
 */
function calculateBounds(
  nodes: LayoutNode[], 
  xPadding: number, 
  yPadding: number
): LayoutBounds {
  if (nodes.length === 0) {
    return { minX: -100, maxX: 100, minY: -100, maxY: 100 };
  }
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  });
  
  return {
    minX: minX - xPadding,
    maxX: maxX + xPadding,
    minY: minY - yPadding,
    maxY: maxY + yPadding
  };
}