// src/app/_components/metro/core/useMapInteraction.ts
import { useState, useRef, useCallback } from 'react';

interface MapInteractionState {
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
}

interface MapInteractionOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomFactor?: number;
  initialZoom?: number;
}

export function useMapInteraction(options: MapInteractionOptions = {}) {
  const {
    minZoom = 0.5,
    maxZoom = 5,
    zoomFactor = 1.2,
    initialZoom = 1
  } = options;
  
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * zoomFactor, maxZoom));
  }, [zoomFactor, maxZoom]);
  
  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / zoomFactor, minZoom));
  }, [zoomFactor, minZoom]);
  
  const zoomReset = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);
  
  const centerOnPoint = useCallback((x: number, y: number, viewBoxWidth: number, viewBoxHeight: number) => {
    // Calculate new pan to center the point
    const centerX = viewBoxWidth / 2;
    const centerY = viewBoxHeight / 2;
    
    setPan({
      x: centerX - x,
      y: centerY - y
    });
  }, []);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent, viewBoxWidth: number, viewBoxHeight: number, svgWidth: number, svgHeight: number) => {
    if (!isDragging.current) return;
    
    // Calculate distance moved
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Update drag start position
    dragStart.current = { x: e.clientX, y: e.clientY };
    
    // Calculate pan factor based on SVG dimensions
    const factorX = viewBoxWidth / svgWidth;
    const factorY = viewBoxHeight / svgHeight;
    
    // Update pan state
    setPan(prev => ({
      x: prev.x + (dx * factorX) / zoom,
      y: prev.y + (dy * factorY) / zoom
    }));
  }, [zoom]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Zoom in or out based on wheel direction
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomIn, zoomOut]);
  
  // Calculate transform for zoom and pan
  const transformValue = `scale(${zoom}) translate(${pan.x}, ${pan.y})`;
  
  return {
    zoom,
    pan,
    transformValue,
    zoomIn,
    zoomOut,
    zoomReset,
    centerOnPoint,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    isDragging: isDragging.current
  };
}