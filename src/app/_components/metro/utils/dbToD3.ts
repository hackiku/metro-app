// src/app/_components/metro/utils/dbToD3.ts
import type { CareerPath, Role, Transition } from '~/types/career';
import type { MetroLine, MetroNode, MetroConnection, MetroData, Point } from '~/types/metro';

/**
 * Transforms career paths from database format to D3-compatible metro visualization format
 * 
 * @param careerPaths Career paths from the database
 * @param transitions Role transitions
 * @returns Transformed data ready for D3 rendering
 */
export function transformCareerDataToD3(
  careerPaths: CareerPath[],
  transitions: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[]
): MetroData {
  // Step 1: Convert career paths to metro lines
  const lines: MetroLine[] = careerPaths.map(path => ({
    id: path.id,
    name: path.name,
    color: path.color,
    nodes: path.roles.map(role => ({
      id: role.id,
      name: role.name,
      level: role.level,
      x: role.level * 150, // Initial x positioning based on level
      y: 0 // Will be calculated by layout engine
    }))
  }));
  
  // Step 2: Calculate initial y positions for lines
  positionLinesVertically(lines);
  
  // Step 3: Identify and adjust interchange nodes
  identifyInterchangeNodes(lines);
  
  // Step 4: Transform transitions to connections
  const connections: MetroConnection[] = transitions.map(t => ({
    fromId: t.fromRoleId,
    toId: t.toRoleId,
    isRecommended: t.isRecommended,
    pathId: findPathIdForRole(t.fromRoleId, careerPaths)
  }));
  
  return { lines, connections };
}

/**
 * Position lines vertically with equal spacing
 */
function positionLinesVertically(lines: MetroLine[]): void {
  const pathSpacing = 140; // Vertical space between metro lines
  const initialPadding = 100; // Top padding
  
  lines.forEach((line, index) => {
    const yPosition = initialPadding + (index * pathSpacing);
    
    // Set y position for all nodes in this line
    line.nodes.forEach(node => {
      node.y = yPosition;
    });
  });
}

/**
 * Identify nodes that appear in multiple lines and mark them as interchanges
 * Adjust their positions to be between the involved lines
 */
function identifyInterchangeNodes(lines: MetroLine[]): void {
  // Create a map of node IDs to their occurrences in different lines
  const nodeMap = new Map<string, { lineIndices: number[], node: MetroNode }>();
  
  // First pass: collect all nodes and which lines they belong to
  lines.forEach((line, lineIndex) => {
    line.nodes.forEach(node => {
      if (!nodeMap.has(node.id)) {
        nodeMap.set(node.id, { 
          lineIndices: [lineIndex],
          node
        });
      } else {
        nodeMap.get(node.id)?.lineIndices.push(lineIndex);
      }
    });
  });
  
  // Second pass: adjust position for interchange nodes
  nodeMap.forEach(({ lineIndices, node }, nodeId) => {
    // If node appears in multiple lines, it's an interchange
    if (lineIndices.length > 1) {
      // Calculate average y position
      const avgY = lineIndices.reduce((sum, lineIndex) => {
        return sum + lines[lineIndex].nodes.find(n => n.id === nodeId)!.y;
      }, 0) / lineIndices.length;
      
      // Update y position in all occurrences
      lineIndices.forEach(lineIndex => {
        const nodeInLine = lines[lineIndex].nodes.find(n => n.id === nodeId);
        if (nodeInLine) {
          nodeInLine.y = avgY;
          nodeInLine.isInterchange = true;
        }
      });
    }
  });
}

/**
 * Find the career path ID that contains a specific role
 */
function findPathIdForRole(roleId: string, careerPaths: CareerPath[]): string | undefined {
  for (const path of careerPaths) {
    if (path.roles.some(role => role.id === roleId)) {
      return path.id;
    }
  }
  return undefined;
}

/**
 * Get a Map of role IDs to their positions for quick lookup
 */
export function createRolePositionMap(careerPaths: CareerPath[]): Map<string, Point> {
  const positionMap = new Map<string, Point>();
  
  careerPaths.forEach(path => {
    path.roles.forEach(role => {
      if (role.x !== undefined && role.y !== undefined) {
        positionMap.set(role.id, { 
          x: role.x, 
          y: role.y 
        });
      }
    });
  });
  
  return positionMap;
}