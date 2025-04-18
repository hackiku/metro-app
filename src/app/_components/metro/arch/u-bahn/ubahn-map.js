// Condensed version of ubahn-map.js
// Focuses on initialization flow, data loading, zoom, and interaction handling structure.

// --- Global State (Illustrative - Manage with React state/context) ---
// var mapData = { lines: [], stations: {}, meta: {} }; // Store processed map data & metadata
// var currentFocusStation = null; // Store selected station info

// --- Initialization ---
var container = document.getElementById('ubahn-map'); // Use React ref equivalent
var width = /* calculate desired width */;
var height = /* calculate desired height */;

// Instantiate the map component
var map = tubeMap() // Assumes tubeMap function from condensed d3-tube-map.js is available
	.width(width)
	.height(height)
	.on('click', handleStationClick); // Setup click handler

// --- Data Loading ---
Promise.all([
	fetch('./json/berlin-ubahn.json').then(res => res.json()),
	fetch('./json/meta.json').then(res => res.json())
]).then(([mapJsonData, metaData]) => {
	// Store metadata (conceptually)
	// mapData.meta = metaData;

	// Initialize map with data
	// In React: Pass mapJsonData to the main Map component via props or context
	container.datum(mapJsonData).call(map); // D3 way of binding data

	// Store processed data (conceptually)
	// mapData.lines = map.data().lines;
	// mapData.stations = map.data().stations;

	// Trigger initial draw
	map.drawAll(); // Renders lines, stations, labels

	// Setup Zoom
	setupZoom(container.select('svg')); // D3 way to select SVG

}).catch(error => console.error("Error loading map data:", error));


// --- Zoom Logic ---
function setupZoom(svgElement) {
	var zoom = d3.zoom()
		.scaleExtent([0.5, 10]) // Min/max zoom levels
		.on('zoom', zoomed);

	svgElement.call(zoom); // Attach zoom behavior to SVG

	// Apply initial zoom/pan if needed (details omitted)
	// zoom.translateTo(svgElement, initialX, initialY);
	// zoom.scaleTo(svgElement, initialScale);

	function zoomed(event) {
		// Apply transform to the main map group <g>
		// In React: Update a state variable holding the transform string, apply to the <g> element
		var transform = event.transform;
		svgElement.select('g').attr('transform', transform); // D3 way
		// React equivalent: setTransformState(transform.toString());
	}
}

// --- Interaction Handling ---
function handleStationClick(event, stationData) {
	// event = D3 event object
	// stationData = the data bound to the clicked station element (contains coords, label, name, etc.)

	console.log("Station clicked:", stationData.name);

	// 1. Update Application State (React equivalent)
	// setCurrentFocusStation(stationData);
	// highlightStation(stationData.name); // Visually indicate selection

	// 2. Fetch/Find Related Data
	var servingLineNames = getStationLines(stationData.name, /* mapData.lines */);
	var neighbours = stationNeighbours(stationData, /* mapData.lines */, /* mapData.stations */);
	// console.log("Serving Lines:", servingLineNames);
	// console.log("Neighbours:", neighbours);

	// 3. Trigger UI Update (React equivalent)
	// updateSidebarComponent(stationData, servingLineNames, neighbours, /* mapData.meta[stationData.name] */);
	// Show sidebar, display details, prev/next buttons etc.

	// --- Original code fetched Wiki data here ---
	// fetchWikiData(stationData);
	// --- Original code updated DOM directly here ---
	// $('#lines-for-station').html(...)
	// $('#sidebar-footer').html(...)
}

// --- Data Query Helpers (Potentially reusable logic) ---

// Find all lines serving a given station
function getStationLines(stationName, allLines) {
	// Filters allLines to find lines containing stationName
	// Returns array of line names (e.g., ['U1', 'U3'])
	// Needs helper: normalizeStationName(name) to handle variations like '(Berlin)'
	return allLines
		.filter(line => line.stations.includes(normalizeStationName(stationName)))
		.map(line => line.name)
		.sort();
}

// Find previous/next stations for navigation
function stationNeighbours(currentStation, allLines, allStations) {
	// Finds the current line and station index.
	// Determines previous/next station, handling line wraps.
	// Requires currentStation to have a 'currentLineName' property (or infers one).
	// Returns { previous: stationObject, next: stationObject }
	var currentLineName = currentStation.currentLineName || getStationLines(currentStation.name, allLines)[0];
	var line = allLines.find(l => l.name === currentLineName);
	if (!line) return { previous: null, next: null };

	var stationNameNormalized = normalizeStationName(currentStation.name);
	var index = line.stations.indexOf(stationNameNormalized);
	var prevStationName, nextStationName;
	var prevLineName = currentLineName, nextLineName = currentLineName;

	if (index > 0) {
		prevStationName = line.stations[index - 1];
	} else { // Wrap around to previous line end
		var lineIndex = allLines.findIndex(l => l.name === currentLineName);
		var prevLine = allLines[lineIndex > 0 ? lineIndex - 1 : allLines.length - 1];
		prevStationName = prevLine.stations[prevLine.stations.length - 1];
		prevLineName = prevLine.name;
	}

	if (index < line.stations.length - 1) {
		nextStationName = line.stations[index + 1];
	} else { // Wrap around to next line start
		var lineIndex = allLines.findIndex(l => l.name === currentLineName);
		var nextLine = allLines[lineIndex < allLines.length - 1 ? lineIndex + 1 : 0];
		nextStationName = nextLine.stations[0];
		nextLineName = nextLine.name;
	}

	// Look up station objects and add the line context
	var prevStation = allStations[prevStationName] ? { ...allStations[prevStationName], currentLineName: prevLineName } : null;
	var nextStation = allStations[nextStationName] ? { ...allStations[nextStationName], currentLineName: nextLineName } : null;

	return { previous: prevStation, next: nextStation };
}

// Simplified helper (assuming it exists)
function normalizeStationName(stationName) {
	return stationName.replace(/[0-9()]/g, '').trim(); // Basic example
}