// src/app/_components/metro/hooks/useMetroMap.ts
import { useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useLayout } from './useLayout';
import { useZoom } from './useZoom';
import type { CareerPath } from '~/types/career';
import type { MetroNode } from '~/types/metro';

interface UseMetroMapProps {
  careerPaths: CareerPath[];
  transitions: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[];
  currentRoleId?: string | null;
  targetRoleId?: string | null;
  selectedRoleId?: string | null;
  onSelectRole?: (roleId: string) => void;
  debug?: boolean;
}

export function useMetroMap({
  careerPaths,
  transitions,
  currentRoleId,
  targetRoleId,
  selectedRoleId,
  onSelectRole,
  debug = false
}: UseMetroMapProps) {
  // References
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Get layout data using our layout hook
  const { lines, connections } = useLayout(careerPaths, transitions);
  
  // Create a flat list of all nodes
  const allNodes = useMemo(() => 
    lines.flatMap(line => line.nodes), 
    [lines]
  );
  
  // Set up zoom behavior
  const { transform, zoomIn, zoomOut, zoomReset, centerOn, zoomLevel } = useZoom(svgRef, {
    minZoom: 0.5,
    maxZoom: 8
  });
  
  // Handle node selection
  const handleNodeClick = useCallback((nodeId: string) => {
    if (onSelectRole) {
      onSelectRole(nodeId);
    }
  }, [onSelectRole]);
  
  // Calculate scales based on node positions
  const [xScale, yScale] = useMemo(() => {
    if (allNodes.length === 0) {
      return [
        d3.scaleLinear().domain([0, 100]).range([0, dimensions.width]),
        d3.scaleLinear().domain([0, 100]).range([0, dimensions.height])
      ];
    }
    
    // Find min/max values
    const xExtent = d3.extent(allNodes, d => d.x) as [number, number];
    const yExtent = d3.extent(allNodes, d => d.y) as [number, number];
    
    // Add some padding
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, dimensions.width]);
      
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([0, dimensions.height]);
      
    return [xScale, yScale];
  }, [allNodes, dimensions]);
  
  // Function to center on a role
  const centerOnRole = useCallback((roleId: string) => {
    const node = allNodes.find(n => n.id === roleId);
    if (!node || !svgRef.current) return;
    
    // Convert node coordinates through the scale
    const x = xScale(node.x);
    const y = yScale(node.y);
    
    // Use zoom controller to center
    centerOn(x, y);
  }, [allNodes, xScale, yScale, centerOn]);
  
  // Find path color for a role
  const findPathColorForRole = useCallback((roleId: string): string => {
    for (const line of lines) {
      if (line.nodes.some(node => node.id === roleId)) {
        return line.color;
      }
    }
    return "#888"; // Default color
  }, [lines]);
  
  // Find role object from ID
  const findRoleById = useCallback((roleId: string) => {
    for (const path of careerPaths) {
      const role = path.roles.find(r => r.id === roleId);
      if (role) {
        return role;
      }
    }
    return null;
  }, [careerPaths]);
  
  return {
    svgRef,
    containerRef,
    dimensions,
    setDimensions,
    lines,
    connections,
    allNodes,
    transform,
    zoomLevel,
    zoomIn,
    zoomOut,
    zoomReset,
    centerOnRole,
    handleNodeClick,
    xScale,
    yScale,
    findPathColorForRole,
    findRoleById
  };
}