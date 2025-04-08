// src/app/_components/metro/player/Player.tsx
"use client"

import { useState, useEffect } from "react"
import { supabase } from "~/server/db/supabase"

interface CurrentPosition {
	x: number
	y: number
	stationId: string
}

export function Player() {
	const [currentPosition, setCurrentPosition] = useState<CurrentPosition>({
		x: 50,
		y: 50,
		stationId: ""
	})

	useEffect(() => {
		async function fetchUserPosition() {
			try {
				// Fetch the demo user
				const { data: userData, error: userError } = await supabase
					.schema('gasunie')
					.from('demo_users')
					.select('current_station_id')
					.single()

				if (userError || !userData) {
					console.error('Error fetching user data:', userError)
					return
				}

				// Get the station's position
				const { data: stationData, error: stationError } = await supabase
					.schema('gasunie')
					.from('metro_stations')
					.select('position_x, position_y')
					.eq('id', userData.current_station_id)
					.single()

				if (stationError || !stationData) {
					console.error('Error fetching station data:', stationError)
					return
				}

				// Update the position
				setCurrentPosition({
					x: stationData.position_x || 50,
					y: stationData.position_y || 50,
					stationId: userData.current_station_id
				})
			} catch (error) {
				console.error('Error loading user position:', error)
			}
		}

		fetchUserPosition()
	}, [])

	return (
		<div className="pointer-events-none absolute inset-0 z-20">
			<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
				{/* Player marker */}
				<g transform={`translate(${currentPosition.x}, ${currentPosition.y})`}>
					{/* Outer pulsing circle */}
					<circle
						className="animate-ping"
						r="4"
						fill="rgba(99, 102, 241, 0.3)"
					/>

					{/* Inner solid circle */}
					<circle
						r="3"
						fill="rgb(99, 102, 241)"
						stroke="white"
						strokeWidth="1"
					/>

					{/* Center dot */}
					<circle
						r="1"
						fill="white"
					/>
				</g>
			</svg>
		</div>
	)
}