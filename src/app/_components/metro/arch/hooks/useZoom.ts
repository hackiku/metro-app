// src/app/_components/metro/hooks/useZoom.ts
import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface ZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  onZoomChange?: (transform: d3.ZoomTransform) => void;
}

export function useZoom(svgRef: React.RefObject<SVGSVGElement>, options: ZoomOptions = {}) {
  const {
    minZoom = 0.5,
    maxZoom = 8,
    initialZoom = 1,
    onZoomChange
  } = options;

  const [transform, setTransform] = useState(d3.zoomIdentity.scale(initialZoom));
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // Initialize zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([minZoom, maxZoom])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const newTransform = event.transform;
        setTransform(newTransform);
        
        if (onZoomChange) {
          onZoomChange(newTransform);
        }
      });

    zoomBehavior.current = zoom;
    
    const svg = d3.select(svgRef.current);
    svg.call(zoom);
    
    // Disable double-click zoom (we'll handle it separately)
    svg.on('dblclick.zoom', null);

    // Set initial transform if needed
    if (initialZoom !== 1) {
      svg.call(zoom.transform, d3.zoomIdentity.scale(initialZoom));
    }

    return () => {
      // Clean up zoom behavior
      svg.on('.zoom', null);
    };
  }, [svgRef, minZoom, maxZoom, initialZoom, onZoomChange]);

  // Zoom control functions
  const zoomIn = (factor = 1.2) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehavior.current.scaleBy, factor);
  };

  const zoomOut = (factor = 1.2) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehavior.current.scaleBy, 1 / factor);
  };

  const zoomReset = () => {
    if (!svgRef.current || !zoomBehavior.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomBehavior.current.transform, d3.zoomIdentity);
  };

  const centerOn = (x: number, y: number) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = parseInt(svg.style('width'));
    const height = parseInt(svg.style('height'));

    svg.transition()
      .duration(500)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(transform.k)
          .translate(-x, -y)
      );
  };

  return {
    transform,
    zoomIn,
    zoomOut,
    zoomReset,
    centerOn,
    zoomLevel: transform.k
  };
}