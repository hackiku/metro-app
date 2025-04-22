// ~/app/skill-tree/GameTabs.tsx

"use client"

import { Brain, Code, Map, Network, Users } from "lucide-react"

interface GameTabsProps {
	activeTab: string
	onTabChange: (tab: string) => void
}

// Visualization options
const VISUALIZATIONS = [
	{
		id: "technical",
		name: "Metro Map",
		icon: <Map className="h-5 w-5" />,
		color: "bg-amber-500"
	},
	{
		id: "core",
		name: "D3 Tangled Tree",
		icon: <Network className="h-5 w-5" />,
		color: "bg-indigo-600"
	},
	{
		id: "leadership",
		name: "Skill Tree",
		icon: <Brain className="h-5 w-5" />,
		color: "bg-emerald-600"
	},
	{
		id: "specialist",
		name: "Force Graph",
		icon: <Code className="h-5 w-5" />,
		color: "bg-rose-600"
	},
	{
		id: "soft",
		name: "Matrix View",
		icon: <Users className="h-5 w-5" />,
		color: "bg-purple-600"
	}
]

export function GameTabs({ activeTab, onTabChange }: GameTabsProps) {
	return (
		<div className="flex items-center space-x-1 rounded-xl bg-white/90 px-6 py-3 shadow-xl backdrop-blur-sm dark:bg-neutral-800/90">
			{VISUALIZATIONS.map(viz => (
				<button
					key={viz.id}
					className={`
            flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-all
            ${activeTab === viz.id
							? `${viz.color} text-white`
							: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700'
						}
          `}
					onClick={() => onTabChange(viz.id)}
				>
					{viz.icon}
					<span>{viz.name}</span>
				</button>
			))}
		</div>
	)
}