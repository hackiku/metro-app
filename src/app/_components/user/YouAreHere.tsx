// src/app/_components/user/YouAreHere.tsx
"use client"

import { useEffect, useState } from "react"
import { useUser } from "~/contexts/UserContext"

interface YouAreHereProps {
	currentNodeId: string | null;
	containerRef: React.RefObject<HTMLDivElement>;
}

export function YouAreHere({ currentNodeId, containerRef }: YouAreHereProps) {
	const { currentUser } = useUser()
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isVisible, setIsVisible] = useState(false)

	// Update position when node changes or coordinates are available
	useEffect(() => {
		if (!currentNodeId || typeof window === 'undefined') {
			setIsVisible(false)
			return
		}

		// Check for station coordinates
		const updatePosition = () => {
			if (window._metroStationCoordinates &&
				window._metroStationCoordinates[currentNodeId]) {
				const coords = window._metroStationCoordinates[currentNodeId]
				setPosition({ x: coords.x, y: coords.y - 35 }) // Position above the station
				setIsVisible(true)
			} else {
				setIsVisible(false)
			}
		}

		// Try immediately
		updatePosition()

		// Also set up an interval to check for coordinates
		// This helps when coordinates are set after the component mounts
		const intervalId = setInterval(updatePosition, 500)

		return () => clearInterval(intervalId)
	}, [currentNodeId])

	if (!isVisible) return null

	return (
		<div className="pointer-events-none absolute inset-0 z-20">
			{/* User position indicator */}
			<div
				className="absolute transform -translate-x-1/2 -translate-y-1/2"
				style={{
					left: `${position.x}px`,
					top: `${position.y}px`,
				}}
			>
				<div className="relative flex flex-col items-center">
					{/* Pulsing circle */}
					<div className="w-8 h-8 rounded-full bg-primary/20 animate-ping absolute"></div>

					{/* Solid indicator */}
					<div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg z-10">
						<span className="text-xs font-bold text-primary-foreground">
							{currentUser?.full_name ? currentUser.full_name[0] : "U"}
						</span>
					</div>

					{/* "You are here" label */}
					<div className="bg-background text-xs font-medium px-2 py-0.5 rounded mt-1 shadow-sm border border-border whitespace-nowrap">
						You are here
					</div>
				</div>
			</div>
		</div>
	)
}