// ~/app/_components/metro/map/MetroMap.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { MetroLine } from "./MetroLine"

// Sample data structure for skill tree lines
const SAMPLE_SKILL_LINES = {
	core: [
		{
			id: "problem-solving",
			name: "Problem Solving",
			color: "#3b82f6", // blue
			stations: [
				{ id: "ps-1", name: "Basic Analysis", level: 1, x: 20, y: 30 },
				{ id: "ps-2", name: "Problem Framing", level: 2, x: 35, y: 30 },
				{ id: "ps-3", name: "Advanced Analysis", level: 3, x: 50, y: 40 },
				{ id: "ps-4", name: "Complex Problem Solving", level: 4, x: 65, y: 50 },
			]
		},
		{
			id: "communication",
			name: "Communication",
			color: "#ef4444", // red
			stations: [
				{ id: "com-1", name: "Basic Communication", level: 1, x: 20, y: 70 },
				{ id: "com-2", name: "Effective Messaging", level: 2, x: 35, y: 70 },
				{ id: "com-3", name: "Stakeholder Communication", level: 3, x: 50, y: 60 },
				{ id: "com-4", name: "Strategic Communication", level: 4, x: 65, y: 50 },
			]
		}
	],
	technical: [
		// Technical skill lines would go here
	],
	leadership: [
		// Leadership skill lines would go here
	]
}

interface MetroMapProps {
	activeSkillCategory: string
}

export function MetroMap({ activeSkillCategory }: MetroMapProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(1)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

	// Get the skill lines for the active category
	const skillLines = SAMPLE_SKILL_LINES[activeSkillCategory as keyof typeof SAMPLE_SKILL_LINES] || []

	// Handle mouse wheel for zooming
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault()
			const delta = -Math.sign(e.deltaY) * 0.1
			setScale(prevScale => Math.max(0.5, Math.min(2, prevScale + delta)))
		}

		const container = containerRef.current
		if (container) {
			container.addEventListener('wheel', handleWheel, { passive: false })
		}

		return () => {
			if (container) {
				container.removeEventListener('wheel', handleWheel)
			}
		}
	}, [])

	// Mouse handlers for dragging
	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true)
		setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			})
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	return (
		<div
			ref={containerRef}
			className="h-full w-full cursor-grab overflow-hidden bg-neutral-100 dark:bg-neutral-800"
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			{/* The SVG container for the metro map */}
			<div
				className="h-full w-full"
				style={{
					transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
					transformOrigin: 'center',
					transition: isDragging ? 'none' : 'transform 0.1s ease-out'
				}}
			>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 100 100"
					preserveAspectRatio="xMidYMid meet"
				>
					{/* Grid for visual reference */}
					<g className="grid">
						{[...Array(10)].map((_, i) => (
							<line
								key={`grid-h-${i}`}
								x1="0"
								y1={i * 10}
								x2="100"
								y2={i * 10}
								stroke="rgba(200, 200, 200, 0.2)"
								strokeWidth="0.2"
							/>
						))}
						{[...Array(10)].map((_, i) => (
							<line
								key={`grid-v-${i}`}
								x1={i * 10}
								y1="0"
								x2={i * 10}
								y2="100"
								stroke="rgba(200, 200, 200, 0.2)"
								strokeWidth="0.2"
							/>
						))}
					</g>

					{/* Render each metro line */}
					{skillLines.map(line => (
						<MetroLine key={line.id} line={line} />
					))}
				</svg>
			</div>
		</div>
	)
}