// src/app/_components/metro/d3/interactionHandlers.ts

import * as d3 from 'd3';
import type { ViewportConfig } from '~/types/metro';

/**
 * Interface for the zoom controller object
 */
export interface ZoomController {
	zoomIn: (factor?: number) => void;
	zoomOut: (factor?: number) => void;
	zoomReset: () => void;
	zoomTo: (scale: number) => void;
	centerOn: (x: number, y: number) => void;
	getTransform: () => d3.ZoomTransform;
	getZoomLevel: () => number;
}

/**
 * Sets up zoom and pan interactions for the metro map
 * 
 * @param svg The D3 selection for the SVG element
 * @param mapGroup The D3 selection for the map group that will be transformed
 * @param config Configuration options for zoom behavior
 * @param onZoomChange Optional callback for zoom changes
 * @returns A controller object for programmatic zoom control
 */
export function setupInteraction(
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
	config: Partial<ViewportConfig> = {},
	onZoomChange?: (transform: d3.ZoomTransform) => void
): ZoomController {

	// Default configuration
	const defaultConfig: ViewportConfig = {
		initialZoom: 1,
		minZoom: 0.5,
		maxZoom: 8,
		zoomFactor: 1.2
	};

	// Merge with provided config
	const zoomConfig: ViewportConfig = { ...defaultConfig, ...config };

	// Create zoom behavior
	const zoom = d3.zoom<SVGSVGElement, unknown>()
		.scaleExtent([zoomConfig.minZoom, zoomConfig.maxZoom])
		.on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
			// Apply transformation to the map group
			const transform = event.transform;
			mapGroup.attr('transform', transform.toString());

			// Call the callback if provided
			if (onZoomChange) {
				onZoomChange(transform);
			}
		});

	// Apply zoom to SVG
	svg.call(zoom)
		// Disable double-click zoom (we'll handle it manually)
		.on('dblclick.zoom', null);

	// Initialize with a specific transform if needed
	if (zoomConfig.initialZoom !== 1) {
		const width = parseInt(svg.style('width'));
		const height = parseInt(svg.style('height'));
		const initialTransform = d3.zoomIdentity
			.translate(width / 2, height / 2)
			.scale(zoomConfig.initialZoom)
			.translate(-width / 2, -height / 2);

		svg.call(zoom.transform, initialTransform);
	}

	// Optional click-to-pan behavior
	svg.on('click', (event: MouseEvent) => {
		// Only handle clicks on the background, not on nodes
		if ((event.target as Element).tagName === 'svg') {
			// Could implement center-on-click here
		}
	});

	// Current transform reference
	let currentTransform = d3.zoomIdentity;

	// Update the current transform on zoom
	zoom.on('zoom.track', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
		currentTransform = event.transform;
	});

	// Return the controller object
	return {
		zoomIn: (factor = zoomConfig.zoomFactor) => {
			svg.transition()
				.duration(300)
				.call(zoom.scaleBy, factor);
		},

		zoomOut: (factor = zoomConfig.zoomFactor) => {
			svg.transition()
				.duration(300)
				.call(zoom.scaleBy, 1 / factor);
		},

		zoomReset: () => {
			svg.transition()
				.duration(500)
				.call(zoom.transform, d3.zoomIdentity);
		},

		zoomTo: (scale: number) => {
			svg.transition()
				.duration(500)
				.call(zoom.scaleTo, scale);
		},

		centerOn: (x: number, y: number) => {
			const width = parseInt(svg.style('width'));
			const height = parseInt(svg.style('height'));

			svg.transition()
				.duration(500)
				.call(
					zoom.transform,
					d3.zoomIdentity
						.translate(width / 2, height / 2)
						.scale(currentTransform.k)
						.translate(-x, -y)
				);
		},

		getTransform: () => currentTransform,

		getZoomLevel: () => currentTransform.k
	};
}

/**
 * Setup mouse wheel zoom that centers on cursor position
 * 
 * @param svg The SVG element
 * @param zoom The d3.zoom behavior
 */
export function setupWheelZoom(
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	zoom: d3.ZoomBehavior<Element, unknown>
) {
	svg.on('wheel', (event: WheelEvent) => {
		// Prevent default browser behavior
		event.preventDefault();

		// Get mouse position relative to SVG
		const p = d3.pointer(event, svg.node());

		// Determine zoom direction
		const direction = event.deltaY < 0 ? 1 : -1;
		const factor = Math.pow(1.2, direction);

		// Apply zoom centered on mouse position
		svg.call(
			zoom.translateBy,
			-(p[0] * (factor - 1)),
			-(p[1] * (factor - 1))
		);
		svg.call(zoom.scaleBy, factor);
	});
}