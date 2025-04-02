// ~/app/_components/metro/player/Player.tsx

"use client"

// This component represents the user's avatar on the skill map
export function Player() {
	// In a real implementation, this would come from user data
	const currentPosition = {
		x: 50,  // SVG coordinate
		y: 50,  // SVG coordinate
		stationId: "ps-3"  // ID of the current station
	}

	return (
		<div className="pointer-events-none absolute inset-0 z-10">
			<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
				{/* Player marker */}
				<g transform={`translate(${currentPosition.x}, ${currentPosition.y})`}>
					{/* Pulsing circle effect */}
					<circle className="animate-ping" r="1.5" fill="rgba(59, 130, 246, 0.3)" />

					{/* Main avatar circle */}
					<circle r="2" fill="#3b82f6" stroke="white" strokeWidth="0.5" />

					{/* Player icon/avatar could go here */}
				</g>
			</svg>
		</div>
	)
}