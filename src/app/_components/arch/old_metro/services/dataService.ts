// src/app/_components/metro/services/dataService.ts

import { supabase } from "~/server/db/supabase";

export interface Station {
	id: string;
	name: string;
	description?: string;
	level: number;
	isInterchange: boolean;
	x: number; // Change from optional to required to match MetroStation
	y: number; // Change from optional to required to match MetroStation
	lineId: string;
}


export interface Line {
	id: string;
	name: string;
	color: string;
	description?: string;
	stations: Station[];
}

export interface Connection {
	id: string;
	fromStationId: string;
	toStationId: string;
	difficulty: number;
	months: number;
	isRecommended: boolean;
}

export interface Interchange {
	stationId: string;
	lineIds: string[];
}

export interface MetroData {
	lines: Line[];
	connections: Connection[];
	interchanges: Interchange[];
}

export interface StationDetail {
	name: string;
	description: string;
	level: number;
	skills: { name: string; importance: number }[];
	developmentSteps: {
		name: string;
		description: string;
		duration: number;
		type: string;
	}[];
}

// Fetch all data needed for the metro map
export async function fetchMetroData(schema: string = 'gasunie'): Promise<MetroData> {
	try {
		console.log(`Fetching metro data from ${schema} schema`);

		// Step 1: Fetch all metro lines
		const { data: linesData, error: linesError } = await supabase
			.schema(schema)
			.from('metro_lines')
			.select('id, name, color, description');

		if (linesError) {
			console.error('Error fetching lines:', linesError);
			throw linesError;
		}

		if (!linesData || linesData.length === 0) {
			console.warn('No lines found in database');
			return { lines: [], connections: [], interchanges: [] };
		}

		// Step 2: Fetch all stations
		const { data: stationsData, error: stationsError } = await supabase
			.schema(schema)
			.from('metro_stations')
			.select(`
        id, 
        name, 
        description,
        metro_line_id,
        job_level_id,
        is_interchange,
        position_x, 
        position_y
      `);

		if (stationsError) {
			console.error('Error fetching stations:', stationsError);
			throw stationsError;
		}

		// Step 3: Fetch job levels for mapping
		const { data: levelsData, error: levelsError } = await supabase
			.schema(schema)
			.from('job_levels')
			.select('id, level_number');

		if (levelsError) {
			console.error('Error fetching job levels:', levelsError);
			throw levelsError;
		}

		// Create a map of job level IDs to level numbers
		const levelMap = new Map();
		levelsData?.forEach(level => {
			levelMap.set(level.id, Number(level.level_number));
		});

		// Step 4: Fetch all connections between stations
		const { data: connectionsData, error: connectionsError } = await supabase
			.schema(schema)
			.from('station_connections')
			.select(`
        id,
        from_station_id,
        to_station_id,
        transition_difficulty,
        estimated_months,
        is_recommended
      `);

		if (connectionsError) {
			console.error('Error fetching connections:', connectionsError);
			throw connectionsError;
		}

		// Step 5: Fetch line interconnections (for stations that belong to multiple lines)
		const { data: interconnectionsData, error: interconnectionsError } = await supabase
			.schema(schema)
			.from('line_interconnections')
			.select(`
        station_id,
        line_one_id,
        line_two_id
      `);

		if (interconnectionsError) {
			console.error('Error fetching interconnections:', interconnectionsError);
			throw interconnectionsError;
		}

		// Process the data into our simplified format

		// First, organize stations by line
		const lineStations = new Map<string, Station[]>();
		const stationLineMap = new Map<string, string>(); // Track primary line for each station

		linesData.forEach(line => {
			lineStations.set(line.id, []);
		});

		// Process all stations
		stationsData?.forEach(station => {
			const level = levelMap.get(station.job_level_id) || 1;

			const processedStation: Station = {
				id: station.id,
				name: station.name,
				description: station.description,
				level,
				isInterchange: station.is_interchange || false,
				lineId: station.metro_line_id,
				x: station.position_x || 0,
				y: station.position_y || 0
			};

			// Add to its line's station list
			const lineStationList = lineStations.get(station.metro_line_id);
			if (lineStationList) {
				lineStationList.push(processedStation);
				stationLineMap.set(station.id, station.metro_line_id);
			}
		});

		// Process connections
		const connections: Connection[] = connectionsData?.map(conn => ({
			id: conn.id,
			fromStationId: conn.from_station_id,
			toStationId: conn.to_station_id,
			difficulty: conn.transition_difficulty || 1,
			months: conn.estimated_months || 12,
			isRecommended: conn.is_recommended || false
		})) || [];

		// Process interchanges
		const interchangesMap = new Map<string, string[]>();

		// First add all stations marked as interchanges
		stationsData?.forEach(station => {
			if (station.is_interchange) {
				interchangesMap.set(station.id, [station.metro_line_id]);
			}
		});

		// Then add line interconnections
		interconnectionsData?.forEach(interconnect => {
			const stationId = interconnect.station_id;
			let lines = interchangesMap.get(stationId) || [];

			if (!lines.includes(interconnect.line_one_id)) {
				lines.push(interconnect.line_one_id);
			}

			if (!lines.includes(interconnect.line_two_id)) {
				lines.push(interconnect.line_two_id);
			}

			interchangesMap.set(stationId, lines);
		});

		const interchanges: Interchange[] = Array.from(interchangesMap.entries())
			.map(([stationId, lineIds]) => ({
				stationId,
				lineIds
			}));

		// Build the lines with their stations
		const lines: Line[] = linesData.map(line => ({
			id: line.id,
			name: line.name,
			color: line.color,
			description: line.description,
			stations: lineStations.get(line.id) || []
		}));

		// If there's no data, generate some dummy data for the demo
		if (lines.length === 0 || lines.every(line => line.stations.length === 0)) {
			console.log("No data found, generating dummy data for visualization");
			return generateDummyData();
		}

		return {
			lines,
			connections,
			interchanges
		};

	} catch (error) {
		console.error('Error in fetchMetroData:', error);
		// Return dummy data as fallback
		return generateDummyData();
	}
}

// Fetch details for a specific station
export async function fetchStationDetails(stationId: string, schema: string = 'gasunie'): Promise<StationDetail | null> {
	try {
		// Get station basic info
		const { data: station, error: stationError } = await supabase
			.schema(schema)
			.from('metro_stations')
			.select('id, name, description, job_level_id')
			.eq('id', stationId)
			.single();

		if (stationError || !station) {
			console.error('Error fetching station details:', stationError);
			return null;
		}

		// Get job level
		const { data: level } = await supabase
			.schema(schema)
			.from('job_levels')
			.select('level_number')
			.eq('id', station.job_level_id)
			.single();

		// Get skills for this station
		const { data: skillsData } = await supabase
			.schema(schema)
			.from('station_skills')
			.select(`
        importance_level,
        skill_id,
        skills:skill_id(name)
      `)
			.eq('station_id', stationId);

		// Process skills
		// Process skills
		const skills = skillsData?.map(skill => {
			// Check if skill.skills is an array, has at least one element, and that element has a name
			const skillName = (Array.isArray(skill.skills) && skill.skills.length > 0 && skill.skills[0]?.name)
				? skill.skills[0].name // Access name from the first element
				: 'Unnamed Skill'; // Fallback if any check fails

			return {
				name: skillName,
				importance: skill.importance_level || 3
			};
		}) || [];
		// Get development steps
		const { data: connectionsData } = await supabase
			.schema(schema)
			.from('station_connections')
			.select('id')
			.eq('to_station_id', stationId);

		const connectionIds = connectionsData?.map(conn => conn.id) || [];

		const { data: stepsData } = await supabase
			.schema(schema)
			.from('development_steps')
			.select(`
        name, description, step_type, duration_weeks
      `)
			.in('connection_id', connectionIds.length > 0 ? connectionIds : ['none']);

		// Process development steps
		const developmentSteps = stepsData?.map(step => ({
			name: step.name,
			description: step.description || '',
			duration: step.duration_weeks || 12,
			type: step.step_type || 'Training'
		})) || [];

		// If data is missing, provide fallbacks
		if (skills.length === 0) {
			skills.push(
				{ name: "Analytical Thinking", importance: 4 },
				{ name: "Technical Knowledge", importance: 5 },
				{ name: "Communication", importance: 3 }
			);
		}

		if (developmentSteps.length === 0) {
			developmentSteps.push(
				{
					name: "Technical Training",
					description: "Complete specialized training in relevant areas",
					duration: 12,
					type: "Training"
				},
				{
					name: "Project Experience",
					description: "Participate in cross-functional projects",
					duration: 24,
					type: "Experience"
				}
			);
		}

		return {
			name: station.name,
			description: station.description || "Position in the organization's structure",
			level: level?.level_number || 1,
			skills,
			developmentSteps
		};

	} catch (error) {
		console.error('Error in fetchStationDetails:', error);

		// Return fallback data
		return {
			name: "Sample Position",
			description: "A position in the career development path",
			level: 2,
			skills: [
				{ name: "Core Knowledge", importance: 5 },
				{ name: "Technical Skills", importance: 4 },
				{ name: "Communication", importance: 3 }
			],
			developmentSteps: [
				{
					name: "Technical Training",
					description: "Complete specialized training",
					duration: 12,
					type: "Training"
				},
				{
					name: "Project Work",
					description: "Hands-on project experience",
					duration: 24,
					type: "Experience"
				}
			]
		};
	}
}

// Generate dummy data for testing and fallback
// Generate dummy data for testing and fallback
function generateDummyData(): MetroData {
	const lines: Line[] = [
		{
			id: "line1",
			name: "Engineering Track",
			color: "#003366", // Blue
			stations: []
		},
		{
			id: "line2",
			name: "Management Track",
			color: "#FF671F", // Orange
			stations: []
		},
		{
			id: "line3",
			name: "Support Track",
			color: "#666666", // Gray
			stations: []
		}
	];

	// Add stations to each line
	const stations: Station[] = [
		// Engineering Track
		{
			id: "s1",
			name: "Junior Engineer",
			level: 1,
			isInterchange: false,
			lineId: "line1",
			x: 150, // Added default coordinates
			y: 100
		},
		{
			id: "s2",
			name: "Engineer",
			level: 2,
			isInterchange: false,
			lineId: "line1",
			x: 300,
			y: 100
		},
		{
			id: "s3",
			name: "Senior Engineer",
			level: 3,
			isInterchange: false,
			lineId: "line1",
			x: 450,
			y: 100
		},
		{
			id: "s4",
			name: "Principal Engineer",
			level: 4,
			isInterchange: false,
			lineId: "line1",
			x: 600,
			y: 100
		},

		// Management Track
		{
			id: "s5",
			name: "Team Lead",
			level: 2,
			isInterchange: true,
			lineId: "line2",
			x: 300,
			y: 200
		},
		{
			id: "s6",
			name: "Manager",
			level: 3,
			isInterchange: false,
			lineId: "line2",
			x: 450,
			y: 200
		},
		{
			id: "s7",
			name: "Director",
			level: 4,
			isInterchange: false,
			lineId: "line2",
			x: 600,
			y: 200
		},

		// Support Track
		{
			id: "s8",
			name: "Analyst",
			level: 1,
			isInterchange: false,
			lineId: "line3",
			x: 150,
			y: 300
		},
		{
			id: "s9",
			name: "Specialist",
			level: 2,
			isInterchange: false,
			lineId: "line3",
			x: 300,
			y: 300
		},
		{
			id: "s10",
			name: "Project Manager",
			level: 3,
			isInterchange: true,
			lineId: "line3",
			x: 450,
			y: 300
		}
	];

	// Assign stations to lines
	stations.forEach(station => {
		const line = lines.find(l => l.id === station.lineId);
		if (line) {
			line.stations.push(station);
		}
	});

	// Create connections
	const connections: Connection[] = [
		// Engineering progression
		{
			id: "c1",
			fromStationId: "s1",
			toStationId: "s2",
			difficulty: 2,
			months: 18,
			isRecommended: true
		},
		{
			id: "c2",
			fromStationId: "s2",
			toStationId: "s3",
			difficulty: 3,
			months: 24,
			isRecommended: true
		},
		{
			id: "c3",
			fromStationId: "s3",
			toStationId: "s4",
			difficulty: 4,
			months: 36,
			isRecommended: false
		},

		// Management progression
		{
			id: "c4",
			fromStationId: "s5",
			toStationId: "s6",
			difficulty: 3,
			months: 24,
			isRecommended: true
		},
		{
			id: "c5",
			fromStationId: "s6",
			toStationId: "s7",
			difficulty: 4,
			months: 36,
			isRecommended: false
		},

		// Support progression
		{
			id: "c6",
			fromStationId: "s8",
			toStationId: "s9",
			difficulty: 2,
			months: 18,
			isRecommended: true
		},
		{
			id: "c7",
			fromStationId: "s9",
			toStationId: "s10",
			difficulty: 3,
			months: 24,
			isRecommended: true
		},

		// Cross-track connections
		{
			id: "c8",
			fromStationId: "s3",
			toStationId: "s5",
			difficulty: 3,
			months: 12,
			isRecommended: true
		},
		{
			id: "c9",
			fromStationId: "s3",
			toStationId: "s10",
			difficulty: 3,
			months: 12,
			isRecommended: true
		}
	];

	// Create interchanges
	const interchanges: Interchange[] = [
		{
			stationId: "s5",
			lineIds: ["line1", "line2"]
		},
		{
			stationId: "s10",
			lineIds: ["line1", "line3"]
		}
	];

	return {
		lines,
		connections,
		interchanges
	};
}