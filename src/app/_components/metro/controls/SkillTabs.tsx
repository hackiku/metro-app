// ~/app/_components/metro/controls/SkillTabs.tsx

"use client"

import { Brain, Users, Code, Star, Zap } from "lucide-react"

interface SkillTabsProps {
	activeTab: string
	onTabChange: (tab: string) => void
}

// Skill categories with their icons and colors
const SKILL_CATEGORIES = [
	{
		id: "core",
		name: "Core Skills",
		icon: <Brain className="h-5 w-5" />,
		color: "bg-blue-500"
	},
	{
		id: "technical",
		name: "Technical Skills",
		icon: <Code className="h-5 w-5" />,
		color: "bg-purple-500"
	},
	{
		id: "leadership",
		name: "Leadership",
		icon: <Users className="h-5 w-5" />,
		color: "bg-green-500"
	},
	{
		id: "specialist",
		name: "Specialist",
		icon: <Star className="h-5 w-5" />,
		color: "bg-amber-500"
	},
	{
		id: "soft",
		name: "Soft Skills",
		icon: <Zap className="h-5 w-5" />,
		color: "bg-rose-500"
	}
]

export function SkillTabs({ activeTab, onTabChange }: SkillTabsProps) {
	return (
		<div className="mb-8 flex flex-col items-center space-x-1 rounded-xl bg-white/90 py-4 shadow-xl backdrop-blur-xs dark:bg-neutral-800/90">
			{SKILL_CATEGORIES.map(category => (
				<button
					key={category.id}
					className={`
            flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-all
            ${activeTab === category.id
							? `${category.color} text-white`
							: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700'
						}
          `}
					onClick={() => onTabChange(category.id)}
				>
					{category.icon}
					<span>{category.name}</span>
				</button>
			))}
		</div>
	)
}