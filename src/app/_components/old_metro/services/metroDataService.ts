// src/app/_components/metro/services/metroDataService.ts
import { supabase } from "~/server/db/supabase"

// Types
export interface MetroStation {
	id: string
	name: string
	description?: string
	level: number
	x: number
	y: number
}

export interface MetroLine {
	id: string
	name: string
	color: string
	stations: MetroStation[]
}

export interface StationSkill {
	name: string
	importance: number
}

export interface DevelopmentStep {
	name: string
	description: string
	duration: number
	type: string
}

export interface StationDetail {
	name: string
	description: string
	level: number
	skills: StationSkill[]
	developmentSteps: DevelopmentStep[]
}

// Fetch all metro lines with their stations
export async function fetchMetroLines(schema: string = 'gasunie'): Promise<MetroLine[]> {
	try {
		console.log(`Attempting to fetch data from ${schema}.metro_lines`)

		// Fetch metro lines using the schema method
		const { data: linesData, error: linesError } = await supabase
			.schema(schema)
			.from('metro_lines')
			.select('id, name, color, description')

		if (linesError) {
			console.error('Error fetching lines:', linesError.message, linesError.details)
			throw linesError
		}

		console.log(`Successfully fetched ${linesData?.length || 0} metro lines:`, linesData)

		if (!linesData || linesData.length === 0) {
			return []
		}

		// For each line, fetch its stations
		const linesWithStations = await Promise.all(
			linesData.map(async (line) => {
				try {
					console.log(`Fetching stations for line: ${line.id}`)

					const { data: stationsData, error: stationsError } = await supabase
						.schema(schema)
						.from('metro_stations')
						.select(`
              id, 
              name, 
              description,
              position_x, 
              position_y,
              job_level_id
            `)
						.eq('metro_line_id', line.id)
						.order('position_x', { ascending: true })

					if (stationsError) {
						console.error(`Error fetching stations for line ${line.id}:`, stationsError)
						return {
							id: line.id,
							name: line.name,
							color: line.color,
							stations: []
						}
					}

					// For simplicity, let's default to some positions if not available
					const stations = stationsData?.map((station, index) => ({
						id: station.id,
						name: station.name,
						description: station.description,
						level: station.job_level_id ? parseInt(station.job_level_id.slice(0, 1)) || 1 : 1, // Fallback approach
						x: station.position_x || (index * 10 + 10), // Default positions for visualization
						y: station.position_y || ((line.id.charCodeAt(0) % 4) * 10 + 20) // Spread different lines vertically
					})) || []

					console.log(`Found ${stations.length} stations for line ${line.id}`)

					return {
						id: line.id,
						name: line.name,
						color: line.color,
						stations
					}
				} catch (error) {
					console.error(`Error processing line ${line.id}:`, error)
					return {
						id: line.id,
						name: line.name,
						color: line.color,
						stations: []
					}
				}
			})
		)

		// Filter out lines with no stations
		// For demo purposes, if all lines have no stations, generate dummy stations
		let filteredLines = linesWithStations.filter(line => line.stations.length > 0)

		if (filteredLines.length === 0 && linesWithStations.length > 0) {
			console.log("No stations found for any lines. Generating dummy data for visualization.")
			filteredLines = linesWithStations.map((line, lineIndex) => ({
				...line,
				stations: Array.from({ length: 3 }, (_, i) => ({
					id: `dummy-${line.id}-${i}`,
					name: `${line.name} Station ${i + 1}`,
					description: `Demo station for ${line.name}`,
					level: i + 1,
					x: i * 20 + 10,
					y: lineIndex * 20 + 20
				}))
			}))
		}

		console.log(`Returning ${filteredLines.length} lines with stations`)
		return filteredLines
	} catch (error) {
		console.error('Error fetching metro data:', error)
		if (error instanceof Error) {
			console.error('Error message:', error.message)
			console.error('Error stack:', error.stack)
		} else {
			console.error('Unknown error type:', typeof error)
		}
		return []
	}
}

// Fetch detailed information for a station
export async function fetchStationDetails(stationId: string, schema: string = 'gasunie'): Promise<StationDetail | null> {
	try {
		// First get the station's basic info
		const { data: stationData, error: stationError } = await supabase
			.schema(schema)
			.from('metro_stations')
			.select('id, name, description, job_level_id')
			.eq('id', stationId)
			.single()

		if (stationError || !stationData) {
			console.error('Error fetching station details:', stationError)
			return null
		}

		// Get job level info
		const { data: levelData } = await supabase
			.schema(schema)
			.from('job_levels')
			.select('level_number')
			.eq('id', stationData.job_level_id)
			.single()

		// Get skills for this station
		const { data: skillsData } = await supabase
			.schema(schema)
			.from('station_skills')
			.select(`
        importance_level,
        skill_id
      `)
			.eq('station_id', stationId)

		// Get the actual skill details
		const skills: StationSkill[] = []

		if (skillsData && skillsData.length > 0) {
			const skillIds = skillsData.map(item => item.skill_id)

			const { data: skillDetails } = await supabase
				.schema(schema)
				.from('skills')
				.select('id, name, description')
				.in('id', skillIds)

			if (skillDetails) {
				skillsData.forEach(skill => {
					const matchingSkill = skillDetails.find(detail => detail.id === skill.skill_id)
					if (matchingSkill) {
						skills.push({
							name: matchingSkill.name,
							importance: skill.importance_level
						})
					}
				})
			}
		}

		// Get development steps for transitions TO this station
		const { data: connectionsData } = await supabase
			.schema(schema)
			.from('station_connections')
			.select('id')
			.eq('to_station_id', stationId)

		const developmentSteps: DevelopmentStep[] = []

		if (connectionsData && connectionsData.length > 0) {
			const connectionIds = connectionsData.map(item => item.id)

			const { data: stepsData } = await supabase
				.schema(schema)
				.from('development_steps')
				.select(`
          name, description, step_type, duration_weeks
        `)
				.in('connection_id', connectionIds)

			if (stepsData) {
				stepsData.forEach(step => {
					developmentSteps.push({
						name: step.name,
						description: step.description,
						duration: step.duration_weeks,
						type: step.step_type
					})
				})
			}
		}

		// If no real data is found, provide demo data
		if (skills.length === 0) {
			skills.push(
				{ name: "Analytical Thinking", importance: 4 },
				{ name: "Technical Knowledge", importance: 5 },
				{ name: "Communication", importance: 3 },
				{ name: "Project Management", importance: 2 }
			)
		}

		if (developmentSteps.length === 0) {
			developmentSteps.push(
				{
					name: "Technical Training",
					description: "Complete specialized training in relevant technology areas",
					duration: 12,
					type: "Training"
				},
				{
					name: "Project Experience",
					description: "Participate in cross-functional projects",
					duration: 24,
					type: "Experience"
				},
				{
					name: "Certification",
					description: "Obtain industry-standard certification",
					duration: 8,
					type: "Certification"
				}
			)
		}

		return {
			name: stationData.name,
			description: stationData.description || "This position is part of the Gasunie energy transition strategy.",
			level: levelData?.level_number || 1,
			skills,
			developmentSteps
		}
	} catch (error) {
		console.error("Error fetching station details:", error)
		// Provide fallback demo data
		return {
			name: "Demo Position",
			description: "Demo position for Gasunie's energy transition strategy",
			level: 2,
			skills: [
				{ name: "Energy Transition Knowledge", importance: 5 },
				{ name: "Technical Skills", importance: 4 },
				{ name: "Communication", importance: 3 }
			],
			developmentSteps: [
				{
					name: "Technical Training",
					description: "Complete specialized training in relevant technology areas",
					duration: 12,
					type: "Training"
				},
				{
					name: "Project Experience",
					description: "Participate in cross-functional projects",
					duration: 24,
					type: "Experience"
				}
			]
		}
	}
}

// Get a simplified map overview for the MiniMap component
export async function fetchMapOverview(schema: string = 'gasunie') {
	try {
		const { data: linesData, error: linesError } = await supabase
			.schema(schema)
			.from('metro_lines')
			.select('id, color')

		if (linesError) {
			console.error("Error fetching lines for map overview:", linesError)
			return []
		}

		if (!linesData || linesData.length === 0) {
			return []
		}

		// For each line, get station positions
		const linesWithPoints = await Promise.all(
			linesData.map(async (line, lineIndex) => {
				const { data: stationsData } = await supabase
					.schema(schema)
					.from('metro_stations')
					.select('position_x, position_y')
					.eq('metro_line_id', line.id)
					.order('position_x', { ascending: true })

				// If no stations found, return some dummy positions
				if (!stationsData || stationsData.length === 0) {
					return {
						id: line.id,
						color: line.color,
						points: [
							{ x: 10 + lineIndex * 5, y: 20 + lineIndex * 10 },
							{ x: 30 + lineIndex * 5, y: 30 + lineIndex * 10 },
							{ x: 50 + lineIndex * 5, y: 20 + lineIndex * 10 }
						]
					}
				}

				return {
					id: line.id,
					color: line.color,
					points: stationsData.map(station => ({
						x: station.position_x || 0,
						y: station.position_y || 0
					}))
				}
			})
		)

		return linesWithPoints
	} catch (error) {
		console.error('Error fetching mini map data:', error)
		return []
	}
}