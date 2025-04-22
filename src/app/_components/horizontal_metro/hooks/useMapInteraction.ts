
import { useRef, useState, useEffect } from 'react';
import { createMetroRenderer } from '../d3/metroRenderer';
import { setupInteraction } from '../d3/interactionHandlers';
import { transformCareerPathsToD3 } from '../utils/dbToD3';

export function useMetroMap(careerPaths, transitions, options = {}) {
  const [renderer, setRenderer] = useState(null);
  const interactionRef = useRef(null);
  
  // Initialize the renderer when the component mounts
  useEffect(() => {
    const newRenderer = createMetroRenderer();
    setRenderer(newRenderer);
    
    return () => {
      // Cleanup on unmount
    };
  }, []);
  
  // Attach the renderer to a DOM element
  const attachToContainer = (containerElement) => {
    if (!containerElement || !renderer) return;
    
    // Initialize the renderer with the container
    const rendererInstance = renderer.initialize(containerElement);
    
    // Setup zoom/pan interaction
    interactionRef.current = setupInteraction(
      rendererInstance.svg,
      transform => rendererInstance.applyTransform(transform)
    );
    
    // Transform and render initial data
    const d3Data = transformCareerPathsToD3(careerPaths, transitions);
    rendererInstance.updateData(d3Data);
  };
  
  // Update when data changes
  useEffect(() => {
    if (!renderer || !renderer.updateData) return;
    
    const d3Data = transformCareerPathsToD3(careerPaths, transitions);
    renderer.updateData(d3Data);
  }, [renderer, careerPaths, transitions]);
  
  return {
    attachToContainer,
    renderer,
  };
}