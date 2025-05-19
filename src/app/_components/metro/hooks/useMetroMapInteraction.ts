// src/app/_components/metro/hooks/useMetroMapInteraction.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import type { LayoutData } from '~/types/engine';

export interface UseMetroMapInteractionProps {
  layout: LayoutData;
  containerRef: React.RefObject<HTMLDivElement>;
}

export interface MetroMapInteractionState {
  dimensions: { width: number; height: number };
  transform: { x: number; y: number; scale: number };
  isDragging: boolean;
  svgRef: React.RefObject<SVGSVGElement>; // Expose the svgRef
}

export interface MetroMapInteractionMethods {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  centerOnNode: (nodeId: string) => void;
  handleMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseUpOrLeave: () => void;
  // Notice we're not including handleWheel here, since we handle it via useEffect
  handleBackgroundClick: (e: React.MouseEvent<SVGSVGElement>) => void;
}

export function useMetroMapInteraction({
  layout,
  containerRef,
}: UseMetroMapInteractionProps): [MetroMapInteractionState, MetroMapInteractionMethods] {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Update dimensions when container size changes
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;
    
    const updateDimensions = () => {
      const { width, height } = currentContainer.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    };
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(currentContainer);
    updateDimensions();
    
    return () => { resizeObserver.disconnect(); };
  }, [containerRef]);

  // Zoom helper function - using useCallback to prevent recreation
  const zoom = useCallback((factor: number, center?: { x: number, y: number }) => {
    setTransform(prevTransform => {
      const newScale = prevTransform.scale * factor;
      const scale = Math.max(0.1, Math.min(newScale, 8));

      let x = prevTransform.x;
      let y = prevTransform.y;

      if (center) {
        x = center.x - (center.x - prevTransform.x) * (scale / prevTransform.scale);
        y = center.y - (center.y - prevTransform.y) * (scale / prevTransform.scale);
      } else {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        x = centerX - (centerX - prevTransform.x) * (scale / prevTransform.scale);
        y = centerY - (centerY - prevTransform.y) * (scale / prevTransform.scale);
      }

      return { x, y, scale };
    });
  }, [dimensions]);

  // Zoom methods
  const zoomIn = useCallback(() => zoom(1.2), [zoom]);
  const zoomOut = useCallback(() => zoom(1 / 1.2), [zoom]);

  const zoomReset = useCallback(() => {
    if (!layout || !containerRef.current) return;
    const { bounds } = layout;
    const { width, height } = dimensions;
    const { minX, maxX, minY, maxY } = bounds;
    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;

    if (boundsWidth <= 0 || boundsHeight <= 0) {
      setTransform({ x: width / 2, y: height / 2, scale: 1 });
      return;
    };

    const padding = 50;
    const effectiveWidth = Math.max(1, width - padding * 2);
    const effectiveHeight = Math.max(1, height - padding * 2);
    const scaleX = effectiveWidth / boundsWidth;
    const scaleY = effectiveHeight / boundsHeight;
    const scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));
    const x = (width / 2) - ((minX + maxX) / 2) * scale;
    const y = (height / 2) - ((minY + maxY) / 2) * scale;
    setTransform({ x, y, scale });
  }, [layout, dimensions, containerRef]);

  // Reset zoom when layout or dimensions change
  useEffect(() => {
    zoomReset();
  }, [layout, dimensions.width, dimensions.height, zoomReset]);

  const centerOnNode = useCallback((nodeId: string) => {
    if (!layout?.nodesById || !layout.nodesById[nodeId]) return;
    const node = layout.nodesById[nodeId];
    const { width, height } = dimensions;
    const currentScale = transform.scale;
    const x = width / 2 - node.x * currentScale;
    const y = height / 2 - node.y * currentScale;
    setTransform(prev => ({ ...prev, x, y }));
  }, [layout, dimensions, transform.scale]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Allow panning only if not clicking directly on a station or button
    let targetElement = e.target as Element;
    // Traverse up if needed (e.g., clicking text inside station group)
    while (targetElement && targetElement !== svgRef.current) {
      if (targetElement.classList.contains('metro-station')) {
        return; // Don't start drag on station click
      }
      targetElement = targetElement.parentElement as Element;
    }

    // Only allow pan with main button
    if (e.button !== 0) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart]);

  const handleMouseUpOrLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Reset dragging state just in case mouseup didn't fire correctly
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  // The internal wheel event handler - not exposed in the methods
  const handleWheelInternal = useCallback((e: WheelEvent) => {
    // We still need to prevent default to stop page scrolling
    e.preventDefault();
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    
    zoom(factor, { x: mouseX, y: mouseY });
  }, [zoom]);
  
  // Set up wheel event with proper options
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    // Use the native addEventListener with { passive: false } to allow preventDefault
    svg.addEventListener('wheel', handleWheelInternal, { passive: false });
    
    return () => {
      svg.removeEventListener('wheel', handleWheelInternal);
    };
  }, [handleWheelInternal]);

  const state: MetroMapInteractionState = {
    dimensions,
    transform,
    isDragging,
    svgRef
  };

  const methods: MetroMapInteractionMethods = {
    zoomIn,
    zoomOut,
    zoomReset,
    centerOnNode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    handleBackgroundClick
  };

  return [state, methods];
}