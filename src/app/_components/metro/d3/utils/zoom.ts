// src/app/_components/metro/d3/utils/zoom.ts
import * as d3 from "d3"

// Create zoom behavior for metro map
export function createZoomBehavior(onZoom: (transform: d3.ZoomTransform) => void) {
	return d3.zoom()
		.scaleExtent([0.5, 5]) // Min and max zoom levels
		.on("zoom", (event) => {
			onZoom(event.transform)
		})
}

// Apply zoom to a selection
export function applyZoom(selection: d3.Selection<any, any, any, any>, zoom: d3.ZoomBehavior<any, any>) {
	selection.call(zoom as any)
	return selection
}

// Reset zoom to identity
export function resetZoom(selection: d3.Selection<any, any, any, any>, zoom: d3.ZoomBehavior<any, any>) {
	zoom.transform(selection as any, d3.zoomIdentity)
}