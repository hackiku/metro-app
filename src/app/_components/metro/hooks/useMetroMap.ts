// src/app/_components/metro/hooks/useMetroMap.ts
import { useRef, useState, useEffect, useCallback } from 'react';
import { createMetroRenderer, type RendererInstance } from '../d3/metroRenderer';
import { setupInteraction, type ZoomController } from '../d3/interactionHandlers';
import { transformCareerDataToD3 } from '../utils/dbToD3';
import type { CareerPath } from '~/types/career';
import type { Point } from '~/types/metro';

interface UseMetroMapProps {
  careerPaths: CareerPath[];
  transitions: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[];
  currentRoleId?: string | null;
  targetRoleId?: string | null;
  selectedRoleId?: string | null;
  onSelectRole?: (roleId: string) => void;
  onSetCurrentRole?: (roleId: string) => void;
  onSetTargetRole?: (roleId: string) => void;
  onViewDetails?: (roleId: string) => void;
  debug?: boolean;
  onTransformChange?: (transform: string) => void;
}

export function useMetroMap({
  careerPaths,
  transitions,
  currentRoleId,
  targetRoleId,
  selectedRoleId,
  onSelectRole,
  onSetCurrentRole,
  onSetTargetRole,
  onViewDetails,
  debug = false,
  onTransformChange
}: UseMetroMapProps) {
  // References to maintain across renders
  const containerRef = useRef<HTMLElement | null>(null);
  const rendererRef = useRef<RendererInstance | null>(null);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const rendererCreatorRef = useRef<any>(null);
  
  // State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [d3Data, setD3Data] = useState<any>(null);
  
  // Process career data into D3 format
  useEffect(() => {
    const transformedData = transformCareerDataToD3(careerPaths, transitions);
    setD3Data(transformedData);
  }, [careerPaths, transitions]);
  
  // Update when selected role changes
  useEffect(() => {
    if (rendererRef.current && selectedRoleId !== undefined) {
      rendererRef.current.selectNode(selectedRoleId);
    }
  }, [selectedRoleId]);
  
  // Update special roles (current/target)
  const updateSpecialRoles = useCallback((current: string | null, target: string | null) => {
    if (rendererCreatorRef.current && rendererCreatorRef.current.setSpecialRoles) {
      rendererCreatorRef.current.setSpecialRoles(current, target);
    }
  }, []);
  
  // Handle node selection
  const handleNodeSelected = useCallback((nodeId: string | null) => {
    if (onSelectRole && nodeId) {
      onSelectRole(nodeId);
    }
  }, [onSelectRole]);
  
  // Get current node positions from the renderer
  const getPositions = useCallback(() => {
    if (!d3Data) return new Map<string, Point>();
    
    // Collect positions from all lines
    const positions = new Map<string, Point>();
    d3Data.lines.forEach((line: any) => {
      line.nodes.forEach((node: any) => {
        positions.set(node.id, { x: node.x, y: node.y });
      });
    });
    
    return positions;
  }, [d3Data]);
  
  // Attach the renderer to a DOM element
  const attachToContainer = useCallback((element: HTMLElement) => {
    if (!element) return;
    containerRef.current = element;
    
    // Clear any existing content
    element.innerHTML = '';
    
    // Create renderer
    const renderer = createMetroRenderer({
      debugGrid: debug
    });
    
    // Store the renderer creator for access to its methods
    rendererCreatorRef.current = renderer;
    
    // Initialize renderer
    const rendererInstance = renderer.initialize(element);
    rendererRef.current = rendererInstance;
    
    // Set node selection callback
    renderer.setNodeSelectedCallback(handleNodeSelected);
    
    // Set initial special roles
    if (currentRoleId || targetRoleId) {
      renderer.setSpecialRoles(currentRoleId || null, targetRoleId || null);
    }
    
    // Setup zoom/pan interaction
    const zoomController = setupInteraction(
      rendererInstance.svg,
      rendererInstance.mapGroup,
      { initialZoom: 1 },
      (transform) => {
        // Update zoom level state when it changes
        setZoomLevel(transform.k);
        
        // Pass transform string to callback if provided
        if (onTransformChange) {
          onTransformChange(transform.toString());
        }
      }
    );
    zoomControllerRef.current = zoomController;
    
    // Initial render if data is available
    if (d3Data) {
      rendererInstance.updateData(d3Data);
    }
    
    // Cleanup function
    return () => {
      element.innerHTML = '';
    };
  }, [d3Data, debug, handleNodeSelected, onTransformChange, currentRoleId, targetRoleId]);
  
  // Update renderer when data changes
  useEffect(() => {
    if (rendererRef.current && d3Data) {
      rendererRef.current.updateData(d3Data);
    }
  }, [d3Data]);
  
  // Center on a role
  const centerOnRole = useCallback((roleId: string) => {
    if (!rendererRef.current) return;
    
    rendererRef.current.centerOnNode(roleId);
  }, []);
  
  // Zoom controls
  const zoomIn = useCallback(() => {
    zoomControllerRef.current?.zoomIn();
  }, []);
  
  const zoomOut = useCallback(() => {
    zoomControllerRef.current?.zoomOut();
  }, []);
  
  const zoomReset = useCallback(() => {
    zoomControllerRef.current?.zoomReset();
  }, []);
  
  return {
    attachToContainer,
    zoomIn,
    zoomOut,
    zoomReset,
    centerOnRole,
    zoomLevel,
    getPositions,
    updateSpecialRoles
  };
}

export default useMetroMap;