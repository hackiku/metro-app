// Condensed version of d3-tube-map.js
// Focuses on data structure, scaling, path generation, and rendering structure.

function tubeMap() {
	// Configuration Defaults
	var margin = { top: 80, right: 80, bottom: 20, left: 80 };
	var width = 760;
	var height = 640;
	var lineWidthMultiplier = 0.7; // Controls base line width relative to grid unit
	var lineWidthTickRatio = 1; // Ratio for station tick size calculation

	// Internal state
	var xScale = d3.scaleLinear();
	var yScale = d3.scaleLinear();
	var lineWidth;
	var _data; // Transformed data cache
	var gMap; // Main SVG group for the map

	// --- Core Map Function ---
	function map(selection) {
		selection.each(function (data) {
			// 1. Transform Raw Data
			_data = transformData(data);

			// 2. Calculate Scales based on Coordinate Extents
			var minX = d3.min(_data.raw, l => d3.min(l.nodes, n => n.coords[0])) - 1;
			var maxX = d3.max(_data.raw, l => d3.max(l.nodes, n => n.coords[0])) + 1;
			var minY = d3.min(_data.raw, l => d3.min(l.nodes, n => n.coords[1])) - 1;
			var maxY = d3.max(_data.raw, l => d3.max(l.nodes, n => n.coords[1])) + 1;

			// Adjust range to maintain aspect ratio (details omitted for brevity)
			var maxXRange = width - margin.left - margin.right;
			var maxYRange = height - margin.top - margin.bottom;
			// ... aspect ratio calculation logic omitted ...

			xScale.domain([minX, maxX]).range([margin.left, margin.left + maxXRange]);
			yScale.domain([minY, maxY]).range([margin.top + maxYRange, margin.top]); // Flipped Y-axis

			// 3. Calculate dynamic line width based on scale
			var unitLength = Math.abs(xScale(1) - xScale(0) || yScale(1) - yScale(0));
			lineWidth = lineWidthMultiplier * unitLength;

			// 4. Setup SVG structure (simplified)
			var svg = selection.append('svg').style('width', '100%').style('height', '100%');
			gMap = svg.append('g');

			// NOTE: In React, this setup happens via JSX. gMap equivalent is the main transform group.
		});
	}

	// --- Getters/Setters (Simplified) ---
	map.width = function (w) { if (!arguments.length) return width; width = w; return map; };
	map.height = function (h) { if (!arguments.length) return height; height = h; return map; };
	map.data = function () { return { lines: _data.lines, stations: _data.stations }; }; // Expose processed data

	// --- Drawing Entry Point ---
	map.drawAll = function () {
		// Order matters for SVG layering
		drawLines();
		// drawLineLabels(); // Logic for line symbols/logos omitted for brevity
		drawStations(); // Simple station ticks
		drawLongStations(); // Interchange/special station symbols
		drawLabels(); // Station text labels
	};

	// --- Core Path Generation Logic (MOST IMPORTANT) ---
	// Generates the SVG 'd' attribute string for a line based on node coordinates
	function generateLinePath(lineData) {
		var path = '';
		var lineNodes = lineData.nodes;
		var unitLength = Math.abs(xScale(1) - xScale(0) || yScale(1) - yScale(0));
		var sqrt2 = Math.sqrt(2);

		// Offset for parallel lines sharing the same track segment
		var shiftCoords = [
			(lineData.shiftCoords[0] * lineWidth) / unitLength,
			(lineData.shiftCoords[1] * lineWidth) / unitLength,
		];

		var lastSectionType = 'diagonal'; // State used for curve calculation logic

		for (var i = 0; i < lineNodes.length; i++) {
			var currNode = lineNodes[i];
			var nextNode = lineNodes[i + 1];

			if (i === 0) {
				// Start path (Move To) - apply start correction offset
				var startCorrection = calculateCorrection(currNode, nextNode, 'start', unitLength, sqrt2);
				var startPt = [
					xScale(currNode.coords[0] + shiftCoords[0] + startCorrection[0]),
					yScale(currNode.coords[1] + shiftCoords[1] + startCorrection[1]),
				];
				path += 'M' + startPt[0] + ',' + startPt[1];
			}

			if (nextNode) {
				var xDiff = Math.round(currNode.coords[0] - nextNode.coords[0]);
				var yDiff = Math.round(currNode.coords[1] - nextNode.coords[1]);

				// Apply end correction offset
				var endCorrection = calculateCorrection(currNode, nextNode, 'end', unitLength, sqrt2);
				var endPt = [
					xScale(nextNode.coords[0] + shiftCoords[0] + endCorrection[0]),
					yScale(nextNode.coords[1] + shiftCoords[1] + endCorrection[1]),
				];
				var startPt = [ // Re-calculate start point without correction for curve logic
					xScale(currNode.coords[0] + shiftCoords[0]),
					yScale(currNode.coords[1] + shiftCoords[1]),
				];

				// --- Decision Logic for Path Segment Type ---
				if (xDiff === 0 || yDiff === 0) {
					// Horizontal or Vertical Line
					lastSectionType = 'udlr'; // Up-Down-Left-Right
					path += 'L' + endPt[0] + ',' + endPt[1];
				} else if (Math.abs(xDiff) === Math.abs(yDiff) && Math.abs(xDiff) > 0) {
					// Diagonal Line (45 degrees) - Allow >1 steps
					lastSectionType = 'diagonal';
					path += 'L' + endPt[0] + ',' + endPt[1];
				} else if (Math.abs(xDiff) === 1 && Math.abs(yDiff) === 1) {
					// 90-degree bend over 1 grid unit (uses Quadratic Bezier)
					var direction = nextNode.dir ? nextNode.dir.toLowerCase() : (xDiff > 0 ? 'w' : 'e'); // Infer direction if needed
					var controlPt;
					if (direction === 'e' || direction === 'w') controlPt = [endPt[0], startPt[1]]; // Bend via horizontal intermediate
					else controlPt = [startPt[0], endPt[1]]; // Bend via vertical intermediate
					path += 'Q' + controlPt[0] + ',' + controlPt[1] + ',' + endPt[0] + ',' + endPt[1];

				} else if ((Math.abs(xDiff) === 1 && Math.abs(yDiff) === 2) || (Math.abs(xDiff) === 2 && Math.abs(yDiff) === 1)) {
					// Smoother curve over 1x2 or 2x1 grid units (uses Cubic Bezier)
					var controlPoints = calculateCubicControlPoints(startPt, endPt, xDiff, lastSectionType);
					path += 'C' + controlPoints[0] + ',' + controlPoints[1] + ',' + controlPoints[0] + ',' + controlPoints[1] + ',' + endPt[0] + ',' + endPt[1];
					// Note: Original uses same point twice - might simplify to Q or need refinement
				} else {
					// Fallback or other complex cases (e.g., larger jumps) - default to straight line
					console.warn("Unhandled path segment:", currNode.name, 'to', nextNode.name, `diff [${-xDiff}, ${-yDiff}]`);
					path += 'L' + endPt[0] + ',' + endPt[1];
				}
			}
		}
		return path;
	}

	// --- Helper for Path Generation ---
	function calculateCorrection(currNode, nextNode, type, unitLength, sqrt2) {
		if (!nextNode) return [0, 0]; // No correction for last node end

		var xDiff = Math.round(currNode.coords[0] - nextNode.coords[0]);
		var yDiff = Math.round(currNode.coords[1] - nextNode.coords[1]);
		var factor = (type === 'start' ? 1 : -1) * lineWidth / (2 * lineWidthTickRatio * unitLength);

		if (xDiff === 0 && yDiff !== 0) return [0, factor * (yDiff > 0 ? 1 : -1)]; // Vertical
		if (yDiff === 0 && xDiff !== 0) return [factor * (xDiff > 0 ? 1 : -1), 0]; // Horizontal
		if (Math.abs(xDiff) === Math.abs(yDiff)) { // Diagonal
			var factorDiag = factor / sqrt2;
			return [factorDiag * (xDiff > 0 ? 1 : -1), factorDiag * (yDiff > 0 ? 1 : -1)];
		}
		return [0, 0]; // Default no correction
	}

	function calculateCubicControlPoints(p0, p1, xDiff, lastSectionType) {
		// Logic from original code to determine control points for C paths
		// This determines the "smoothness" of the 1x2 or 2x1 bends
		// Simplified placeholder - original logic depends on lastSectionType
		var midX = p0[0] + (p1[0] - p0[0]) / 2;
		var midY = p0[1] + (p1[1] - p0[1]) / 2;
		if (Math.abs(xDiff) === 2) { // Wider bend horizontally
			return [midX, (lastSectionType === 'udlr' ? p0[1] : p1[1])];
		} else { // Wider bend vertically
			return [(lastSectionType === 'udlr' ? p0[0] : p1[0]), midY];
		}
	}

	// --- Drawing Functions (Structure only) ---
	function drawLines() {
		// In React: Iterate _data.lines, render <PathLine d={generateLinePath(line)} color={line.color} ... />
		console.log("Intent: Draw lines using generateLinePath output");
	}

	function drawStations() {
		// In React: Iterate _data.stations.normal, render <Station x={xScale(d.x)} y={yScale(d.y)} type="normal" ... />
		console.log("Intent: Draw normal station symbols (circles/ticks)");
	}

	function drawLongStations() {
		// In React: Iterate _data.stations.long, render <Station x={xScale(d.x)} y={yScale(d.y)} type={d.stationSymbol} ... />
		console.log("Intent: Draw interchange/special station symbols (rects)");
	}

	function drawLabels() {
		// In React: Iterate _data.stations.all, render <StationLabel x={...} y={...} text={d.label} angle={d.labelAngle} pos={calculateTextPos(d)} ... />
		console.log("Intent: Draw station text labels with calculated positions/angles");
	}

	// --- Label Positioning ---
	function calculateTextPos(data) {
		// Logic mapping data.labelPos ('n', 'ne', 'e', etc.) to [x, y] offset and text-anchor
		// Uses lineWidth for offset calculation. (Details omitted for brevity)
		var pos = [0, 0];
		var textAnchor = 'middle';
		var offset = lineWidth * 1.8; // Base offset from station center
		// ... switch statement based on data.labelPos to calculate pos/textAnchor ...
		return { pos: pos, textAnchor: textAnchor };
	}

	// --- Data Transformation ---
	// Merges layout info from lines.nodes into the central stations object
	function transformData(data) {
		var stations = extractStations(data); // Populates station coords, labelPos etc.
		var lines = extractLines(data.lines); // Extracts line metadata and station lists
		return {
			raw: data.lines, // Keep original line data with node details
			stations: stations, // Processed station map keyed by name
			lines: lines // Processed line list
		};
	}

	function extractStations(data) {
		// Iterates data.lines.nodes, finds matching station in data.stations
		// Copies coords, labelPos, shiftCoords, angle etc. from the node onto the station object
		var stationMap = data.stations; // Assume data.stations is { stationName: { label: "..." } }
		data.lines.forEach(function (line) {
			line.nodes.forEach(function (node) {
				if (!node.name) return; // Skip nodes without names (likely path control points)
				var station = stationMap[node.name];
				if (!station) throw new Error('Station not found: ' + node.name);

				// Copy layout/display properties from node to station object
				station.x = node.coords[0];
				station.y = node.coords[1];
				station.labelAngle = node.labelAngle || 0;
				station.labelPos = station.labelPos || node.labelPos; // Use first encountered labelPos
				// Calculate effective shift/labelShift based on node/line defaults
				station.shiftX = node.shiftCoords ? node.shiftCoords[0] : line.shiftCoords[0];
				station.shiftY = node.shiftCoords ? node.shiftCoords[1] : line.shiftCoords[1];
				station.labelShiftX = node.labelShiftCoords ? node.labelShiftCoords[0] : station.shiftX;
				station.labelShiftY = node.labelShiftCoords ? node.labelShiftCoords[1] : station.shiftY;
				station.stationSymbol = node.stationSymbol || 'single'; // 'single', 'double', 'triple' etc.
				// ... other properties like inactive, hide, sBahn, lineLabel ...
			});
		});
		// Helper to convert stationMap object to array if needed elsewhere
		stationMap.toArray = function () { return Object.values(this); };
		return stationMap;
	}

	function extractLines(linesData) {
		// Transforms raw line data into a simpler structure for drawing
		return linesData.map(function (line) {
			return {
				name: line.name,
				title: line.label,
				color: line.color,
				dashed: !!line.dashed,
				shiftCoords: line.shiftCoords, // Crucial for parallel lines
				nodes: line.nodes, // Keep nodes for path generation
				stations: line.nodes.filter(n => n.name).map(n => n.name) // List of station names on this line
			};
		});
	}

	// Return the map instance
	return map;
}