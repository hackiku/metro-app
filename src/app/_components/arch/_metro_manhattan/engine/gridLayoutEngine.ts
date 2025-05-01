// src/app/_components/metro/engine/gridLayoutEngine.ts
import type { CareerPath, Position, PositionDetail } from '~/types/compass';
import type { LayoutNode, LayoutPath, LayoutData, LayoutConfig } from './types';

// Default grid config
const DEFAULT_GRID_CONFIG = {
  cellWidth: 100,
  cellHeight: 80,
  xPadding: 40,
  yPadding: 40,
  levelMultiplier: 1,  // Higher values = more vertical spread
  domainSpread: 1.5,   // Higher values = more horizontal spread
  centerWeight: 0.8    // How much to pull common nodes toward center
};

/**
 * Generates a Manhattan-style grid layout for career paths
 */
export function generateGridLayout(
  careerPaths: CareerPath[],
  positionDetails: PositionDetail[],
  positions: Position[],
  config: Partial<typeof DEFAULT_GRID_CONFIG> = {}
): LayoutData {
  // Merge configs
  const gridConfig = { ...DEFAULT_GRID_CONFIG, ...config };
  
  // Create position lookup
  const positionMap = new Map(positions.map(p => [p.id, p]));
  
  // Calculate which positions appear in multiple paths (interchanges)
  const pathsByPosition = new Map<string, string[]>();
  positionDetails.forEach(detail => {
    if (!pathsByPosition.has(detail.position_id)) {
      pathsByPosition.set(detail.position_id, []);
    }
    pathsByPosition.get(detail.position_id)?.push(detail.career_path_id);
  });
  
  // Group details by path
  const detailsByPath = new Map<string, PositionDetail[]>();
  positionDetails.forEach(detail => {
    if (!detailsByPath.has(detail.career_path_id)) {
      detailsByPath.set(detail.career_path_id, []);
    }
    detailsByPath.get(detail.career_path_id)?.push(detail);
  });
  
  // Sort paths by some criteria (e.g., size or name)
  const sortedPaths = [...careerPaths].sort((a, b) => {
    const pathASize = detailsByPath.get(a.id)?.length || 0;
    const pathBSize = detailsByPath.get(b.id)?.length || 0;
    return pathBSize - pathASize; // Larger paths first
  });
  
  // Assign horizontal lanes to paths
  const pathLanes = new Map<string, number>();
  sortedPaths.forEach((path, index) => {
    pathLanes.set(path.id, index);
  });
  
  // Now create nodes with grid coordinates
  const nodes: LayoutNode[] = [];
  const nodesById: Record<string, LayoutNode> = {};
  
  positionDetails.forEach(detail => {
    const position = positionMap.get(detail.position_id);
    if (!position) return;
    
    const pathLane = pathLanes.get(detail.career_path_id) || 0;
    
    // Calculate base coordinates
    // X coordinate based on path lane
    const baseX = pathLane * gridConfig.cellWidth * gridConfig.domainSpread;
    
    // Y coordinate based on level (inverted so higher levels are at the top)
    const baseY = (10 - detail.level) * gridConfig.cellHeight * gridConfig.levelMultiplier;
    
    // Apply centering adjustment for interchanges
    const paths = pathsByPosition.get(detail.position_id) || [];
    const isInterchange = paths.length > 1;
    
    // If it's an interchange, pull it toward center
    let adjustedX = baseX;
    if (isInterchange) {
      // Calculate average lane position for centering
      const avgLane = paths.reduce((sum, pathId) => {
        return sum + (pathLanes.get(pathId) || 0);
      }, 0) / paths.length;
      
      // Pull toward average position
      adjustedX = baseX * (1 - gridConfig.centerWeight) + 
                 (avgLane * gridConfig.cellWidth * gridConfig.domainSpread) * gridConfig.centerWeight;
    }
    
    // Create node
    const node: LayoutNode = {
      id: detail.id,
      positionId: detail.position_id,
      careerPathId: detail.career_path_id,
      level: detail.level,
      name: position.name,
      x: adjustedX,
      y: baseY,
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
    return {
      id: path.id,
      name: path.name,
      color: path.color || '#cccccc',
      nodes: nodes.filter(n => n.careerPathId === path.id).map(n => n.id),
      angle: 0 // No longer used but kept for compatibility
    };
  });
  
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => {
    pathsById[path.id] = path;
  });
  
  // Calculate bounds
  const bounds = calculateBounds(nodes, gridConfig.xPadding, gridConfig.yPadding);
  
  return {
    nodes,
    nodesById,
    paths,
    pathsById,
    bounds,
    configUsed: gridConfig
  };
}

function calculateBounds(nodes: LayoutNode[], xPadding: number, yPadding: number) {
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