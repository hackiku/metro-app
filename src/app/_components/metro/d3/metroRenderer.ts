// src/app/_components/metro/d3/metroRenderer.ts
import * as d3 from 'd3';
import { generateLinePath } from './pathGenerator';
import type { CareerPath, Role } from '~/types/career';
import type { MetroLine, MetroNode, MetroConnection, RendererConfig } from '~/types/metro';

export interface RendererInstance {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  updateData: (data: { lines: MetroLine[], connections: MetroConnection[] }) => void;
  applyTransform: (transform: d3.ZoomTransform) => void;
  selectNode: (nodeId: string | null) => void;
  highlightNode: (nodeId: string, highlight: boolean) => void;
  centerOnNode: (nodeId: string) => void;
}

export function createMetroRenderer(config: Partial<RendererConfig> = {}) {
  // Default configuration
  const defaultConfig: RendererConfig = {
    margin: { top: 80, right: 80, bottom: 80, left: 80 },
    lineWidth: 8,
    nodeRadius: 12,
    interchangeNodeRadius: 14,
    padding: 50,
    debugGrid: false
  };
  
  // Merge provided config with defaults
  const rendererConfig: RendererConfig = { ...defaultConfig, ...config };
  
  // D3 selections
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let linesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let connectionsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let nodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let debugGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  
  // Scales for converting data coordinates to screen coordinates
  let xScale = d3.scaleLinear();
  let yScale = d3.scaleLinear();
  
  // Track state
  let width = 0;
  let height = 0;
  let selectedNodeId: string | null = null;
  let currentTransform: d3.ZoomTransform = d3.zoomIdentity;
  
  // Store data for redraws
  let currentData: { 
    lines: MetroLine[];
    connections: MetroConnection[];
  } = { lines: [], connections: [] };
  
  // Initialize renderer with container element
  function initialize(container: HTMLElement): RendererInstance {
    // Create main SVG
    svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'metro-map');
    
    // Get initial dimensions
    width = container.clientWidth;
    height = container.clientHeight;
    
    // Create layer groups in the right stacking order
    mapGroup = svg.append('g').attr('class', 'map-group');
    debugGroup = mapGroup.append('g').attr('class', 'debug-grid');
    connectionsGroup = mapGroup.append('g').attr('class', 'connections');
    linesGroup = mapGroup.append('g').attr('class', 'lines');
    nodesGroup = mapGroup.append('g').attr('class', 'nodes');
    
    // Return instance with public methods
    return {
      svg,
      mapGroup,
      updateData,
      applyTransform,
      selectNode,
      highlightNode,
      centerOnNode
    };
  }
  
  // Apply transform for zoom/pan
  function applyTransform(transform: d3.ZoomTransform) {
    currentTransform = transform;
    mapGroup.attr('transform', transform.toString());
  }
  
  // Select a node
  function selectNode(nodeId: string | null) {
    selectedNodeId = nodeId;
    
    // Update visual state for all nodes
    nodesGroup.selectAll('g.node')
      .classed('selected', d => (d as MetroNode).id === selectedNodeId);
      
    // Update opacity for lines based on selection
    linesGroup.selectAll('path.metro-line')
      .style('opacity', selectedNodeId ? 0.6 : 1);
      
    // Update connections visibility based on selection
    connectionsGroup.selectAll('path.connection')
      .style('opacity', d => {
        const conn = d as MetroConnection;
        return selectedNodeId 
          ? (conn.fromId === selectedNodeId || conn.toId === selectedNodeId ? 1 : 0.3)
          : 0.5;
      });
  }
  
  // Highlight a node (for hover effects)
  function highlightNode(nodeId: string, highlight: boolean) {
    nodesGroup.selectAll(`g.node[data-id="${nodeId}"]`)
      .classed('highlighted', highlight);
  }
  
  // Center view on a specific node
  function centerOnNode(nodeId: string) {
    // Find the node in our data
    let targetNode: MetroNode | undefined;
    
    for (const line of currentData.lines) {
      const node = line.nodes.find(n => n.id === nodeId);
      if (node) {
        targetNode = node;
        break;
      }
    }
    
    if (!targetNode) return;
    
    // Get current viewport dimensions
    const viewportWidth = width;
    const viewportHeight = height;
    
    // Calculate the transform to center on this node
    const scale = currentTransform.k;
    const x = -scale * xScale(targetNode.x) + viewportWidth / 2;
    const y = -scale * yScale(targetNode.y) + viewportHeight / 2;
    
    // Animate to the new position
    svg.transition()
      .duration(750)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any, 
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
  }
  
  // Update visualization with new data
  function updateData(data: { lines: MetroLine[], connections: MetroConnection[] }) {
    if (!svg) return;
    
    // Store data for redraws
    currentData = data;
    
    // Calculate scales based on data
    updateScales(data.lines);
    
    // Draw lines
    drawLines(data.lines);
    
    // Draw connections
    drawConnections(data.connections);
    
    // Draw nodes (stations)
    drawNodes(data.lines);
    
    // Draw debug grid if enabled
    if (rendererConfig.debugGrid) {
      drawDebugGrid();
    }
  }
  
  // Calculate scales based on data
  function updateScales(lines: MetroLine[]) {
    // Extract all nodes
    const allNodes = lines.flatMap(line => line.nodes);
    
    if (allNodes.length === 0) return;
    
    // Calculate min/max values
    const minX = d3.min(allNodes, d => d.x) as number - rendererConfig.margin.left;
    const maxX = d3.max(allNodes, d => d.x) as number + rendererConfig.margin.right;
    const minY = d3.min(allNodes, d => d.y) as number - rendererConfig.margin.top;
    const maxY = d3.max(allNodes, d => d.y) as number + rendererConfig.margin.bottom;
    
    // Set scale domains
    xScale.domain([minX, maxX]);
    yScale.domain([minY, maxY]);
    
    // Update ranges based on container size
    xScale.range([rendererConfig.margin.left, width - rendererConfig.margin.right]);
    yScale.range([rendererConfig.margin.top, height - rendererConfig.margin.bottom]);
  }
  
  // Draw metro lines
  function drawLines(lines: MetroLine[]) {
    // Join data to path elements
    const lineSelection = linesGroup.selectAll<SVGPathElement, MetroLine>('path.metro-line')
      .data(lines, d => d.id);
    
    // Remove old paths
    lineSelection.exit().remove();
    
    // Add new paths
    lineSelection.enter()
      .append('path')
      .attr('class', 'metro-line')
      .merge(lineSelection) // Update with existing
      .attr('d', line => generateLinePath(line.nodes, { xScale, yScale }))
      .attr('stroke', line => line.color)
      .attr('stroke-width', rendererConfig.lineWidth)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('data-id', line => line.id);
  }
  
  // Draw connections between nodes
  function drawConnections(connections: MetroConnection[]) {
    // Create connection paths
    const connectionSelection = connectionsGroup.selectAll<SVGPathElement, MetroConnection>('path.connection')
      .data(connections, d => `${d.fromId}-${d.toId}`);
    
    // Remove old connections
    connectionSelection.exit().remove();
    
    // Add new connections
    connectionSelection.enter()
      .append('path')
      .attr('class', 'connection')
      .merge(connectionSelection)
      .attr('d', conn => {
        // Find source and target nodes
        let sourceNode: MetroNode | undefined;
        let targetNode: MetroNode | undefined;
        
        for (const line of currentData.lines) {
          if (!sourceNode) {
            sourceNode = line.nodes.find(n => n.id === conn.fromId);
          }
          if (!targetNode) {
            targetNode = line.nodes.find(n => n.id === conn.toId);
          }
          if (sourceNode && targetNode) break;
        }
        
        if (!sourceNode || !targetNode) return '';
        
        // Generate curved path between nodes
        const x1 = xScale(sourceNode.x);
        const y1 = yScale(sourceNode.y);
        const x2 = xScale(targetNode.x);
        const y2 = yScale(targetNode.y);
        
        // Use a simple curved connection
        const midX = (x1 + x2) / 2;
        return `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
      })
      .attr('stroke', conn => conn.isRecommended ? '#22c55e' : '#9ca3af')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke-dasharray', conn => conn.isRecommended ? 'none' : '5,5')
      .attr('opacity', 0.5);
  }
  
  // Draw station nodes
  function drawNodes(lines: MetroLine[]) {
    // Create a flat list of nodes with their line colors
    const nodesWithLineInfo: (MetroNode & { lineColor: string, isInterchange: boolean })[] = [];
    const nodeMap = new Map<string, string[]>();
    
    // First pass: collect all nodes and which lines they belong to
    lines.forEach(line => {
      line.nodes.forEach(node => {
        if (!nodeMap.has(node.id)) {
          nodeMap.set(node.id, [line.id]);
        } else {
          nodeMap.get(node.id)?.push(line.id);
        }
      });
    });
    
    // Second pass: create the display list with interchange status
    lines.forEach(line => {
      line.nodes.forEach(node => {
        const lineIds = nodeMap.get(node.id) || [];
        if (!nodesWithLineInfo.some(n => n.id === node.id)) {
          nodesWithLineInfo.push({
            ...node,
            lineColor: line.color,
            isInterchange: lineIds.length > 1
          });
        }
      });
    });
    
    // Join data to node groups
    const nodeGroups = nodesGroup.selectAll<SVGGElement, any>('g.node')
      .data(nodesWithLineInfo, d => d.id);
    
    // Remove old nodes
    nodeGroups.exit().remove();
    
    // Create node groups
    const newNodeGroups = nodeGroups.enter()
      .append('g')
      .attr('class', 'node')
      .attr('data-id', d => d.id)
      .style('cursor', 'pointer');
    
    // Merge existing and new nodes for updates
    const allNodeGroups = newNodeGroups.merge(nodeGroups)
      .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
      .classed('selected', d => d.id === selectedNodeId);
    
    // Remove existing shapes
    allNodeGroups.selectAll('circle,rect').remove();
    
    // Add shapes based on whether it's an interchange
    // Regular stations (circles)
    allNodeGroups.filter(d => !d.isInterchange)
      .append('circle')
      .attr('r', rendererConfig.nodeRadius)
      .attr('fill', 'var(--background, white)')
      .attr('stroke', d => d.lineColor)
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-200');
    
    // Interchange stations (squares)
    allNodeGroups.filter(d => d.isInterchange)
      .append('rect')
      .attr('x', -rendererConfig.interchangeNodeRadius)
      .attr('y', -rendererConfig.interchangeNodeRadius)
      .attr('width', rendererConfig.interchangeNodeRadius * 2)
      .attr('height', rendererConfig.interchangeNodeRadius * 2)
      .attr('rx', 4)
      .attr('fill', 'var(--background, white)')
      .attr('stroke', d => d.lineColor)
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-200');
    
    // Add or update level labels below nodes
    allNodeGroups.selectAll('text.level-label')
      .data(d => [d])
      .join('text')
      .attr('class', 'level-label')
      .attr('y', d => d.isInterchange ? 
        rendererConfig.interchangeNodeRadius + 20 : 
        rendererConfig.nodeRadius + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted-foreground)')
      .attr('font-size', '12px')
      .text(d => `Level ${d.level}`);
    
    // Add click handler
    allNodeGroups.on('click', (event, d) => {
      event.stopPropagation();
      selectNode(d.id === selectedNodeId ? null : d.id);
      const customEvent = new CustomEvent('nodeSelected', { 
        detail: { nodeId: d.id === selectedNodeId ? null : d.id }
      });
      container.dispatchEvent(customEvent);
    });
  }
  
  // Draw debug grid
  function drawDebugGrid() {
    // Get the current domain bounds
    const xDomain = xScale.domain();
    const yDomain = yScale.domain();
    
    // Generate grid lines at 50 unit intervals
    const gridSize = 50;
    const xLines = [];
    const yLines = [];
    
    // X grid lines
    for (let x = Math.floor(xDomain[0] / gridSize) * gridSize; x <= xDomain[1]; x += gridSize) {
      xLines.push(x);
    }
    
    // Y grid lines
    for (let y = Math.floor(yDomain[0] / gridSize) * gridSize; y <= yDomain[1]; y += gridSize) {
      yLines.push(y);
    }
    
    // Draw vertical grid lines
    const xLineSelection = debugGroup.selectAll<SVGLineElement, number>('line.grid-x')
      .data(xLines);
    
    xLineSelection.exit().remove();
    
    xLineSelection.enter()
      .append('line')
      .attr('class', 'grid-x')
      .merge(xLineSelection)
      .attr('x1', d => xScale(d))
      .attr('y1', yScale(yDomain[0]))
      .attr('x2', d => xScale(d))
      .attr('y2', yScale(yDomain[1]))
      .attr('stroke', 'rgba(100, 100, 100, 0.1)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4');
    
    // Draw horizontal grid lines
    const yLineSelection = debugGroup.selectAll<SVGLineElement, number>('line.grid-y')
      .data(yLines);
    
    yLineSelection.exit().remove();
    
    yLineSelection.enter()
      .append('line')
      .attr('class', 'grid-y')
      .merge(yLineSelection)
      .attr('x1', xScale(xDomain[0]))
      .attr('y1', d => yScale(d))
      .attr('x2', xScale(xDomain[1]))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'rgba(100, 100, 100, 0.1)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4');
    
    // Add grid labels
    if (rendererConfig.debugGrid) {
      // X labels
      const xLabelSelection = debugGroup.selectAll<SVGTextElement, number>('text.grid-x-label')
        .data(xLines);
      
      xLabelSelection.exit().remove();
      
      xLabelSelection.enter()
        .append('text')
        .attr('class', 'grid-x-label')
        .merge(xLabelSelection)
        .attr('x', d => xScale(d))
        .attr('y', yScale(yDomain[0]) + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--muted-foreground)')
        .attr('font-size', '10px')
        .text(d => Math.round(d));
      
      // Y labels
      const yLabelSelection = debugGroup.selectAll<SVGTextElement, number>('text.grid-y-label')
        .data(yLines);
      
      yLabelSelection.exit().remove();
      
      yLabelSelection.enter()
        .append('text')
        .attr('class', 'grid-y-label')
        .merge(yLabelSelection)
        .attr('x', xScale(xDomain[0]) - 10)
        .attr('y', d => yScale(d))
        .attr('dy', '0.3em')
        .attr('text-anchor', 'end')
        .attr('fill', 'var(--muted-foreground)')
        .attr('font-size', '10px')
        .text(d => Math.round(d));
    }
  }
  
  // Return the initialization function
  return { initialize };
}