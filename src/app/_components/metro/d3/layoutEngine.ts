// src/app/_components/metro/map/metroRenderer.ts


export function createMetroRenderer(config = {}) {
  // Configuration with defaults
  const margin = config.margin || { top: 80, right: 80, bottom: 20, left: 80 };
  const lineWidth = config.lineWidth || 8;
  
  // Scales
  let xScale = d3.scaleLinear();
  let yScale = d3.scaleLinear();
  
  // Selection references
  let svg = null;
  let mapGroup = null;
  
  // Initialize function (called once)
  function initialize(container, initialData) {
    // Create SVG if it doesn't exist
    svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
      
    // Create map group for transformations
    mapGroup = svg.append('g');
    
    // Setup zoom behavior
    setupZoom(svg, mapGroup);
    
    // Initial render if data is provided
    if (initialData) {
      updateData(initialData);
    }
    
    return {
      svg,
      mapGroup,
      updateData,
      updateViewport
    };
  }
  
  // Data update function
  function updateData(data) {
    // Calculate domain from data bounds
    calculateScales(data);
    
    // Draw all elements
    drawPaths(data.paths);
    drawStations(data.stations);
    drawConnections(data.connections);
  }
  
  // Return the public API
  return {
    initialize
  };
}