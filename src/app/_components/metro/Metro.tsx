// ~/app/_components/metro/Metro.tsx

"use client"

import { useState } from "react"
import { MetroMap } from "./map/MetroMap"
import { Player } from "./player/Player"
import { SkillTabs } from "./controls/SkillTabs"

export function Metro() {
	const [activeSkillTab, setActiveSkillTab] = useState("core")

	return (
		<div className="relative flex h-full w-full flex-col">
			{/* The main map container */}
			<div className="flex-1 overflow-hidden">
				<div className="relative h-full w-full">
					{/* The MetroMap component renders the actual skill tree visualization */}
					<MetroMap activeSkillCategory={activeSkillTab} />

					{/* The Player component shows the user's current position/avatar */}
					<Player />
				</div>
			</div>

			{/* Bottom controls for skill categories */}
			<div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center">
				<SkillTabs
					activeTab={activeSkillTab}
					onTabChange={setActiveSkillTab}
				/>
			</div>
		</div>
	)
}