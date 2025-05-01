// src/app/_components/metro/engine/pathScaler.ts

import type { LayoutNode, PositionDetail, Position, MetroConfig } from './types';

/**
 * Scales node positions on paths based on actual requirements between positions
 * This will allow for proportional spacing of nodes on each path
 */
export interface NodeDistance {
  fromNodeId: string;
  toNodeId: string;
  distance: number; // Relative distance (complexity, skills gap, etc.)
}

/**
 * Calculate uniform segment lengths for nodes on the same path
 * when no specific distances are provided
 */
export function calculateUniformPathDistances(
  nodes: LayoutNode[],
  baseDistance: number = 100
): NodeDistance[] {
  // Group nodes by career path
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  const distances: NodeDistance[] = [];
  
  // Process each path
  nodesByPath.forEach(pathNodes => {
    // Sort nodes by level for consistent ordering
    const sortedNodes = [...pathNodes].sort((a, b) => {
      // First sort by level
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      
      // Then by sequence if available
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      
      return 0;
    });
    
    // Create distance pairs between adjacent nodes
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      distances.push({
        fromNodeId: sortedNodes[i].id,
        toNodeId: sortedNodes[i + 1].id,
        distance: baseDistance
      });
    }
  });
  
  return distances;
}

/**
 * Calculate distances based on skill/certification requirements
 * This method can be expanded with actual requirements data
 */
export function calculateRequirementBasedDistances(
  nodes: LayoutNode[],
  positionDetails: PositionDetail[],
  positions: Position[],
  // This would be a future parameter for skills/requirements data
  // requirementsData: RequirementsData[],
  baseDistance: number = 100
): NodeDistance[] {
  // For now, we'll use a stub implementation that applies varying distances
  // based on level differences, but this would be replaced with actual requirements data
  
  const detailsMap = new Map(positionDetails.map(detail => [detail.id, detail]));
  const positionsMap = new Map(positions.map(pos => [pos.id, pos]));
  
  // Group nodes by career path
  const nodesByPath = new Map<string, LayoutNode[]>();
  nodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  const distances: NodeDistance[] = [];
  
  // Process each path
  nodesByPath.forEach(pathNodes => {
    // Sort nodes by level for consistent ordering
    const sortedNodes = [...pathNodes].sort((a, b) => {
      // First sort by level
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      
      // Then by sequence if available
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      
      return 0;
    });
    
    // Create distance pairs between adjacent nodes with varying distances
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const fromNode = sortedNodes[i];
      const toNode = sortedNodes[i + 1];
      
      // Calculate a distance based on level difference
      // This is a placeholder for actual requirements-based calculation
      const levelDifference = Math.abs(toNode.level - fromNode.level);
      const distance = baseDistance * (1 + levelDifference * 0.5);
      
      distances.push({
        fromNodeId: fromNode.id,
        toNodeId: toNode.id,
        distance: distance
      });
    }
  });
  
  return distances;
}

/**
 * Apply calculated distances to adjust node positions
 * This function modifies the nodes' x,y coordinates while preserving their
 * general direction and alignment with the grid
 */
export function applyPathDistances(
  nodes: LayoutNode[],
  distances: NodeDistance[],
  config: MetroConfig
): LayoutNode[] {
  // Create a lookup for distances
  const distanceMap = new Map<string, number>();
  distances.forEach(dist => {
    const key = `${dist.fromNodeId}-${dist.toNodeId}`;
    distanceMap.set(key, dist.distance);
  });
  
  // Clone nodes to avoid modifying the original array
  const adjustedNodes = [...nodes];
  
  // Group nodes by career path
  const nodesByPath = new Map<string, LayoutNode[]>();
  adjustedNodes.forEach(node => {
    if (!nodesByPath.has(node.careerPathId)) {
      nodesByPath.set(node.careerPathId, []);
    }
    nodesByPath.get(node.careerPathId)!.push(node);
  });
  
  // Process each path
  nodesByPath.forEach(pathNodes => {
    // Sort nodes by level for consistent ordering
    const sortedNodes = [...pathNodes].sort((a, b) => {
      // First sort by level
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      
      // Then by sequence if available
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      
      return 0;
    });
    
    if (sortedNodes.length <= 1) return; // Skip paths with only one node
    
    // Use first node as anchor
    const anchorNode = sortedNodes[0];
    const nodeIndexMap = new Map(sortedNodes.map((node, index) => [node.id, index]));
    
    // Adjust nodes after the anchor
    for (let i = 1; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i];
      const prevNode = sortedNodes[i - 1];
      
      // Get the distance between these nodes
      const distKey = `${prevNode.id}-${currentNode.id}`;
      const distance = distanceMap.get(distKey) || 
        config.radiusStep * Math.abs(currentNode.level - prevNode.level);
      
      // Calculate direction vector from prev to current
      const dx = currentNode.x - prevNode.x;
      const dy = currentNode.y - prevNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length < 0.01) continue; // Skip if nodes are too close
      
      // Normalize and scale by the desired distance
      const dirX = dx / length;
      const dirY = dy / length;
      
      // Update position
      const newPos = {
        x: prevNode.x + dirX * distance,
        y: prevNode.y + dirY * distance
      };
      
      // Find this node in the original array and update it
      const nodeIndex = adjustedNodes.findIndex(n => n.id === currentNode.id);
      if (nodeIndex >= 0) {
        adjustedNodes[nodeIndex] = {
          ...adjustedNodes[nodeIndex],
          x: newPos.x,
          y: newPos.y
        };
        
        // Update in sorted array for next iteration
        sortedNodes[i] = {
          ...sortedNodes[i],
          x: newPos.x,
          y: newPos.y
        };
      }
    }
  });
  
  return adjustedNodes;
}

/**
 * Adjust node spread to prevent crowding at the center
 * This is particularly useful for paths with many nodes
 */
export function adjustNodeSpread(
  nodes: LayoutNode[],
  config: MetroConfig,
  spreadFactor: number = 1.2
): LayoutNode[] {
  // Find center of the layout
  let centerX = 0;
  let centerY = 0;
  
  // Clone nodes to avoid modifying the original array
  const adjustedNodes = [...nodes];
  
  // Group nodes by path and count them
  const pathCounts = new Map<string, number>();
  nodes.forEach(node => {
    const count = pathCounts.get(node.careerPathId) || 0;
    pathCounts.set(node.careerPathId, count + 1);
  });
  
  // Calculate adjusted positions with greater spread for paths with more nodes
  adjustedNodes.forEach((node, i) => {
    const nodeCount = pathCounts.get(node.careerPathId) || 1;
    
    // Scale factor based on the number of nodes in this path
    // More nodes = more spread to prevent crowding
    const scaleFactor = 1 + Math.log(nodeCount) / 10 * spreadFactor;
    
    // Calculate vector from center
    const dx = node.x - centerX;
    const dy = node.y - centerY;
    
    // Apply scaling only to nodes beyond the min radius
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > config.minRadius) {
      // Scale the position outward
      adjustedNodes[i] = {
        ...node,
        x: centerX + dx * scaleFactor,
        y: centerY + dy * scaleFactor
      };
    }
  });
  
  return adjustedNodes;
}