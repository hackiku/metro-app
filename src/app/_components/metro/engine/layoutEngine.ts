// src/app/_components/metro/engine/layoutEngine.ts
import { 
  CareerPath, 
  Position, 
  PositionDetail, 
  LayoutData, 
  LayoutNode, 
  LayoutPath 
} from './types';
import { GRID_CONFIG } from './config';
import { 
  calculatePathStartingPositions, 
  positionNodesAlongPaths, 
  calculateBounds 
} from './gridLayout';
import { 
  optimizeNodePositions
} from './pathRouting';

/**
 * Main layout engine that generates a grid-based layout for career paths
 */
export function generateLayout(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[]
): LayoutData {
  // Validate input data
  if (!careerPaths.length || !positions.length || !positionDetails.length) {
    throw new Error('Cannot generate layout: missing required data');
  }
  
  // Step 1: Calculate starting positions for paths around the center
  const startingPositions = calculatePathStartingPositions(careerPaths);
  
  // Step 2: Position nodes along each path
  let nodes = positionNodesAlongPaths(
    careerPaths,
    positions,
    positionDetails,
    startingPositions
  );
  
  // Step 3: Optimize node positions to avoid overlaps
  nodes = optimizeNodePositions(nodes);
  
  // Step 4: Create path objects with node references
  const paths: LayoutPath[] = careerPaths.map(path => {
    // Get nodes for this path
    const pathNodes = nodes
      .filter(node => node.careerPathId === path.id)
      .sort((a, b) => {
        // First sort by level
        const levelDiff = a.level - b.level;
        if (levelDiff !== 0) return levelDiff;
        
        // Then by sequence if available
        if (a.sequence_in_path !== undefined && b.sequence_in_path !== undefined) {
          return a.sequence_in_path - b.sequence_in_path;
        }
        
        return 0;
      });
    
    return {
      id: path.id,
      name: path.name,
      color: path.color,
      nodes: pathNodes.map(node => node.id)
    };
  });
  
  // Step 5: Build lookup objects
  const nodesById: Record<string, LayoutNode> = {};
  nodes.forEach(node => {
    nodesById[node.id] = node;
  });
  
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => {
    pathsById[path.id] = path;
  });
  
  // Step 6: Calculate bounds
  const bounds = calculateBounds(nodes);
  
  // Step 7: Return complete layout data
  return {
    nodes,
    nodesById,
    paths,
    pathsById,
    bounds,
    configUsed: GRID_CONFIG
  };
}

/**
 * Calculate layout data for a career framework
 * This is the main entry point for the layout engine
 */
export function generateGridLayout(
  careerPaths: CareerPath[],
  positionDetails: PositionDetail[],
  positions: Position[],
  customConfig: Partial<typeof GRID_CONFIG> = {}
): LayoutData {
  // Merge custom config with defaults
  Object.assign(GRID_CONFIG, customConfig);
  
  try {
    // Generate the layout
    return generateLayout(careerPaths, positions, positionDetails);
  } catch (error) {
    console.error('Error generating layout:', error);
    
    // Fallback to a minimal layout
    return createFallbackLayout(careerPaths, positions, positionDetails);
  }
}

/**
 * Creates a simple fallback layout if the main algorithm fails
 * This ensures we always return something usable
 */
function createFallbackLayout(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[]
): LayoutData {
  console.warn('Using fallback layout');
  
  const positionMap = new Map(positions.map(p => [p.id, p]));
  const nodes: LayoutNode[] = [];
  const paths: LayoutPath[] = [];
  
  // Simple grid layout - just arrange in rows and columns
  const spacing = 200;
  const itemsPerRow = 5;
  
  // Group position details by path
  const detailsByPath = new Map<string, PositionDetail[]>();
  positionDetails.forEach(detail => {
    if (!detailsByPath.has(detail.career_path_id)) {
      detailsByPath.set(detail.career_path_id, []);
    }
    detailsByPath.get(detail.career_path_id)?.push(detail);
  });
  
  // Count paths for each position
  const pathsByPosition = new Map<string, string[]>();
  positionDetails.forEach(detail => {
    if (!pathsByPosition.has(detail.position_id)) {
      pathsByPosition.set(detail.position_id, []);
    }
    
    const paths = pathsByPosition.get(detail.position_id);
    if (paths && !paths.includes(detail.career_path_id)) {
      paths.push(detail.career_path_id);
    }
  });
  
  // Create nodes and paths
  careerPaths.forEach((path, pathIndex) => {
    const pathDetails = detailsByPath.get(path.id) || [];
    const pathNodes: string[] = [];
    
    // Sort by level
    const sortedDetails = [...pathDetails].sort((a, b) => a.level - b.level);
    
    sortedDetails.forEach((detail, detailIndex) => {
      const position = positionMap.get(detail.position_id);
      if (!position) return;
      
      // Calculate grid position
      const row = Math.floor(pathIndex / itemsPerRow);
      const col = pathIndex % itemsPerRow;
      
      // Simple vertical stack for each path
      const x = col * spacing;
      const y = row * spacing + detailIndex * 100;
      
      // Check if interchange
      const isInterchange = (pathsByPosition.get(detail.position_id)?.length || 0) > 1;
      
      // Create node
      const node: LayoutNode = {
        id: detail.id,
        positionId: detail.position_id,
        careerPathId: detail.career_path_id,
        level: detail.level,
        name: position.name,
        x,
        y,
        color: path.color,
        isInterchange,
        relatedPaths: pathsByPosition.get(detail.position_id),
        sequence_in_path: detail.sequence_in_path
      };
      
      nodes.push(node);
      pathNodes.push(detail.id);
    });
    
    // Create path
    paths.push({
      id: path.id,
      name: path.name,
      color: path.color,
      nodes: pathNodes
    });
  });
  
  // Build lookup objects
  const nodesById: Record<string, LayoutNode> = {};
  nodes.forEach(node => {
    nodesById[node.id] = node;
  });
  
  const pathsById: Record<string, LayoutPath> = {};
  paths.forEach(path => {
    pathsById[path.id] = path;
  });
  
  // Calculate bounds
  const bounds = calculateBounds(nodes);
  
  // Return minimal layout
  return {
    nodes,
    nodesById,
    paths,
    pathsById,
    bounds,
    configUsed: GRID_CONFIG
  };
}