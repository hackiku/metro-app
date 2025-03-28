// ~/app/_components/metro/Metro.tsx

"use client"

import { useState, useEffect } from "react"
import { MetroMap } from "./map/MetroMap"
import { PositionIndicator } from "./map/PositionIndicator"
import { SkillTabs } from "./controls/SkillTabs"
import { PlayerCard } from "./player/PlayerCard"
import { TangleTree } from "./d3/TangleTree"
import { Card } from "~/components/ui/card"

interface MetroProps {
	activeTab: string
}

export function Metro({ activeTab }: MetroProps) {
	// Debug mode toggle
	const [debugMode, setDebugMode] = useState(false)

	// Render the appropriate visualization based on active tab
	const renderVisualization = () => {
		switch (activeTab) {
			case "core":
				return <TangleTree />;
			case "technical":
				return <MetroMap activeSkillCategory="technical" />;
			default:
				return <MetroMap activeSkillCategory={activeTab} />;
		}
	}

	return (
		<div className="relative flex h-full w-full flex-col">
			{/* The main visualization container */}
			<div className="flex-1 overflow-hidden">
				<div className="relative h-full w-full">
					{/* Render the active visualization */}
					{renderVisualization()}

					{/* The position indicator shows the user's current position on the map */}
					<PositionIndicator />
				</div>
			</div>

			{/* Player card in bottom right */}
			<div className="absolute bottom-24 right-6 z-10">
				<PlayerCard />
			</div>

			{/* Debug panel in top right */}
			<div className="absolute top-4 right-4 z-10">
				<Card className="p-4 shadow-md">
					<button
						className="text-sm font-medium text-blue-600 dark:text-blue-400"
						onClick={() => setDebugMode(!debugMode)}
					>
						{debugMode ? "Hide Debug" : "Show Debug"}
					</button>

					{debugMode && (
						<div className="mt-2">
							<SkillTabs
								activeTab={activeTab}
								onTabChange={() => { }} // Just for debug visualization
							/>
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}