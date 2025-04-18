// src/app/_components/metro/hooks/useMetroMap.ts
import { useRef, useState, useEffect, useCallback } from 'react';
import { createMetroRenderer, type RendererInstance } from '../d3/metroRenderer';
import { setupInteraction, type ZoomController } from '../d3/interactionHandlers';
import { transformCareerDataToD3 } from '../utils/dbToD3';
import type { CareerPath, Role } from '~/types/career';
import type { MetroData } from '~/types/metro';

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
  debug = false
}: UseMetroMapProps) {
  // References to maintain across renders
  const containerRef = useRef<HTMLElement | null>(null);
  const rendererRef = useRef<RendererInstance | null>(null);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  
  // State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [d3Data, setD3Data] = useState<MetroData | null>(null);
  
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
    
    // Initialize renderer
    const rendererInstance = renderer.initialize(element);
    rendererRef.current = rendererInstance;
    
    // Setup zoom/pan interaction
    const zoomController = setupInteraction(
      rendererInstance.svg,
      rendererInstance.mapGroup,
      { initialZoom: 1 },
      (transform) => {
        // Update zoom level state when it changes
        setZoomLevel(transform.k);
      }
    );
    zoomControllerRef.current = zoomController;
    
    // Add event listeners for node interactions
    element.addEventListener('nodeSelected', ((event: CustomEvent) => {
      const { nodeId } = event.detail;
      if (nodeId && onSelectRole) {
        onSelectRole(nodeId);
      }
    }) as EventListener);
    
    // Initial render if data is available
    if (d3Data) {
      rendererInstance.updateData(d3Data);
    }
    
    // Cleanup function
    return () => {
      element.removeEventListener('nodeSelected', (() => {}) as EventListener);
      element.innerHTML = '';
    };
  }, [d3Data, debug, onSelectRole]);
  
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
    zoomLevel
  };
}

export default useMetroMap;