// ~/app/_components/metro/map/MetroLine.tsx

"use client"

import { useState } from "react"

interface Station {
	id: string
	name: string
	level: number
	x: number
	y: number
}

interface LineProps {
	id: string
	name: string
	color: string
	stations: Station[]
}

interface MetroLineProps {
	line: LineProps
}

export function MetroLine({ line }: MetroLineProps) {
	const [hoveredStation, setHoveredStation] = useState<string | null>(null)

	// Generate the path for the line connecting all stations
	const generatePath = () => {
		if (line.stations.length < 2) return ""

		let path = `M ${line.stations[0].x} ${line.stations[0].y}`

		for (let i = 1; i < line.stations.length; i++) {
			const prevStation = line.stations[i - 1]
			const station = line.stations[i]

			// Create a curved line between stations
			// Calculate control points for a nice curve
			const midX = (prevStation.x + station.x) / 2

			path += ` C ${midX} ${prevStation.y}, ${midX} ${station.y}, ${station.x} ${station.y}`
		}

		return path
	}

	return (
		<g className="metro-line">
			{/* Line path */}
			<path
				d={generatePath()}
				stroke={line.color}
				strokeWidth="1.5"
				fill="none"
				strokeLinecap="round"
			/>

			{/* Line Label */}
			<text
				x={line.stations[0].x - 2}
				y={line.stations[0].y - 4}
				fontSize="2"
				fontWeight="bold"
				fill={line.color}
			>
				{line.name}
			</text>

			{/* Stations */}
			{line.stations.map(station => (
				<g
					key={station.id}
					className="station-group"
					onMouseEnter={() => setHoveredStation(station.id)}
					onMouseLeave={() => setHoveredStation(null)}
				>
					{/* Station circle */}
					<circle
						cx={station.x}
						cy={station.y}
						r={hoveredStation === station.id ? "1.5" : "1"}
						fill="white"
						stroke={line.color}
						strokeWidth="0.5"
						className="transition-all duration-200"
					/>

					{/* Station name */}
					<text
						x={station.x}
						y={station.y + 3}
						textAnchor="middle"
						fontSize="1.5"
						fontWeight={hoveredStation === station.id ? "bold" : "normal"}
						fill="currentColor"
						className="transition-all duration-200"
					>
						{station.name}
					</text>

					{/* Station level indicator */}
					<text
						x={station.x}
						y={station.y - 2}
						textAnchor="middle"
						fontSize="1.2"
						fill={line.color}
					>
						Lvl {station.level}
					</text>
				</g>
			))}
		</g>
	)
}