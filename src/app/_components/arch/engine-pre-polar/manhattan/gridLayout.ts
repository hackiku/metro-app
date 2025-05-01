// src/app/_components/metro/engine/gridLayout.ts
import { GRID_CONFIG, getRandomDirection } from './config';
import { LayoutNode, LayoutBounds, CareerPath, Position, PositionDetail, GridCell, Point } from './types';

/**
 * Creates a grid of cells to use for layout
 */
export function createGrid(size: number = GRID_CONFIG.initialGridSize): GridCell[][] {
  const grid: GridCell[][] = [];
  
  // Create a grid with (2*size+1) x (2*size+1) cells centered at (0,0)
  for (let y = -size; y <= size; y++) {
    const row: GridCell[] = [];
    for (let x = -size; x <= size; x++) {
      row.push({
        x: x * GRID_CONFIG.cellWidth,
        y: y * GRID_CONFIG.cellHeight,
        occupied: false
      });
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Find an available cell in the grid in the specified direction
 */
export function findAvailableCell(
  grid: GridCell[][],
  startX: number,
  startY: number,
  direction: { x: number, y: number },
  pathId: string
): GridCell | null {
  // Convert grid coordinates to array indices
  const gridSize = Math.floor(grid.length / 2);
  const startRow = gridSize + Math.round(startY / GRID_CONFIG.cellHeight);
  const startCol = gridSize + Math.round(startX / GRID_CONFIG.cellWidth);
  
  // Normalize direction
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  const dx = direction.x / length;
  const dy = direction.y / length;
  
  // Search along the direction
  let distance = 1;
  const maxDistance = gridSize * 2; // Don't search beyond grid bounds
  
  while (distance < maxDistance) {
    // Calculate next position with some distance
    const stepX = Math.round(dx * distance);
    const stepY = Math.round(dy * distance);
    
    const newRow = startRow + stepY;
    const newCol = startCol + stepX;
    
    // Check if within grid bounds
    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      const cell = grid[newRow][newCol];
      
      // If cell is available, return it
      if (!cell.occupied) {
        return cell;
      }
    }
    
    distance++;
  }
  
  // If no available cell found, expand grid and try again
  return null; // For now, return null - grid expansion would be handled by the layout engine
}

/**
 * Calculate starting positions for each path spreading from center
 */
export function calculatePathStartingPositions(careerPaths: CareerPath[]): Map<string, Point> {
  const positions = new Map<string, Point>();
  const numPaths = careerPaths.length;
  
  // If only one path, start at center
  if (numPaths === 1) {
    positions.set(careerPaths[0].id, { x: 0, y: 0 });
    return positions;
  }
  
  // Calculate angles to distribute paths evenly if wanted,
  // or use random directions with minimum angle variation
  const directions: { pathId: string, direction: { x: number, y: number } }[] = [];
  
  // Simple approach: use random directions but ensure some minimum angle between them
  careerPaths.forEach(path => {
    let attempts = 0;
    let valid = false;
    let newDirection;
    
    // Try to find a direction that's not too close to existing ones
    while (!valid && attempts < 20) {
      newDirection = getRandomDirection();
      valid = true;
      
      // Check against existing directions
      for (const { direction } of directions) {
        const dotProduct = newDirection.x * direction.x + newDirection.y * direction.y;
        // If dot product is close to 1, directions are similar
        if (dotProduct > 0.8) {
          valid = false;
          break;
        }
      }
      
      attempts++;
    }
    
    directions.push({
      pathId: path.id,
      direction: newDirection || getRandomDirection() // Use whatever we got if attempts maxed out
    });
  });
  
  // Start all paths at or near center
  // Could adjust this later for more sophisticated positioning
  directions.forEach(({ pathId, direction }) => {
    // Add a small initial offset to avoid all paths starting exactly at center
    const initialOffset = GRID_CONFIG.cellWidth / 2;
    const startX = direction.x * initialOffset;
    const startY = direction.y * initialOffset;
    
    positions.set(pathId, { x: startX, y: startY });
  });
  
  return positions;
}

/**
 * Calculate node positions along each path
 */
export function positionNodesAlongPaths(
  careerPaths: CareerPath[],
  positions: Position[],
  positionDetails: PositionDetail[],
  startingPositions: Map<string, Point>
): LayoutNode[] {
  const nodes: LayoutNode[] = [];
  const positionMap = new Map(positions.map(p => [p.id, p]));
  
  // Group position details by career path
  const detailsByPath = new Map<string, PositionDetail[]>();
  positionDetails.forEach(detail => {
    if (!detailsByPath.has(detail.career_path_id)) {
      detailsByPath.set(detail.career_path_id, []);
    }
    detailsByPath.get(detail.career_path_id)?.push(detail);
  });
  
  // Count paths for each position to identify interchanges
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
  
  // For each career path, position its nodes
  careerPaths.forEach(path => {
    const pathDetails = detailsByPath.get(path.id) || [];
    const startPos = startingPositions.get(path.id) || { x: 0, y: 0 };
    
    // Sort details by level
    const sortedDetails = [...pathDetails].sort((a, b) => a.level - b.level);
    
    // Create a direction vector for this path
    // For now, use a simple direction based on starting position
    // This will make paths go outward from center
    const direction = {
      x: startPos.x === 0 ? 1 : Math.sign(startPos.x),
      y: startPos.y === 0 ? 1 : Math.sign(startPos.y)
    };
    
    // Position nodes along the path
    sortedDetails.forEach((detail, index) => {
      const position = positionMap.get(detail.position_id);
      if (!position) return; // Skip if position not found
      
      // Calculate distance from center based on level and sequence
      const distance = GRID_CONFIG.nodeSpacing * (index + 1);
      
      // Basic position before any adjustments
      const baseX = startPos.x + direction.x * distance * GRID_CONFIG.cellWidth;
      const baseY = startPos.y + direction.y * distance * GRID_CONFIG.cellHeight;
      
      // Add slight jitter to prevent perfect alignment
      const jitterX = (Math.random() - 0.5) * GRID_CONFIG.jitterFactor * GRID_CONFIG.cellWidth;
      const jitterY = (Math.random() - 0.5) * GRID_CONFIG.jitterFactor * GRID_CONFIG.cellHeight;
      
      // Check if this is an interchange node (appears in multiple paths)
      const isInterchange = (pathsByPosition.get(detail.position_id)?.length || 0) > 1;
      
      // Create node
      nodes.push({
        id: detail.id,
        positionId: detail.position_id,
        careerPathId: detail.career_path_id,
        level: detail.level,
        name: position.name,
        x: baseX + jitterX,
        y: baseY + jitterY,
        color: path.color,
        isInterchange,
        relatedPaths: pathsByPosition.get(detail.position_id),
        sequence_in_path: detail.sequence_in_path
      });
    });
  });
  
  return nodes;
}

/**
 * Calculate bounds for the layout
 */
export function calculateBounds(nodes: LayoutNode[]): LayoutBounds {
  if (nodes.length === 0) {
    return { minX: -500, maxX: 500, minY: -500, maxY: 500 };
  }
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  });
  
  // Add padding
  return {
    minX: minX - GRID_CONFIG.xPadding,
    maxX: maxX + GRID_CONFIG.xPadding,
    minY: minY - GRID_CONFIG.yPadding,
    maxY: maxY + GRID_CONFIG.yPadding
  };
}