// ~/app/_components/metro/player/PlayerCard.tsx

"use client"

import { User, Brain, Shield, Zap, Star } from "lucide-react"
import { Card } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

export function PlayerCard() {
	// Mock player data - would come from a database or API in a real app
	const playerData = {
		name: "Alex Johnson",
		title: "Senior Developer",
		level: 27,
		xp: 7840,
		xpToNextLevel: 10000,
		avatarUrl: null, // Would be an actual URL in production
		stats: [
			{ name: "Technical", value: 78, icon: <Brain className="h-4 w-4" /> },
			{ name: "Leadership", value: 42, icon: <Shield className="h-4 w-4" /> },
			{ name: "Soft Skills", value: 65, icon: <Zap className="h-4 w-4" /> },
			{ name: "Specialist", value: 91, icon: <Star className="h-4 w-4" /> }
		]
	}

	const xpProgress = (playerData.xp / playerData.xpToNextLevel) * 100

	return (
		<Card className="w-52 overflow-hidden bg-card backdrop-blur-sm">
			<div className="bg-indigo-600 dark:bg-indigo-800">
				<div className="flex items-center gap-3">
					{/* Avatar placeholder */}
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-indigo-600">
						{playerData.avatarUrl ? (
							<img
								src={playerData.avatarUrl}
								alt={playerData.name}
								className="h-full w-full rounded-full object-cover"
							/>
						) : (
							<User className="h-6 w-6" />
						)}
					</div>

					<div className="text-white">
						<h3 className="font-semibold">{playerData.name}</h3>
						<p className="text-xs text-indigo-100">{playerData.title}</p>
					</div>
				</div>
			</div>

			<div className="p-3">
				{/* Level and XP */}
				<div className="mb-3">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Level {playerData.level}</span>
						<span className="text-xs text-gray-500 dark:text-gray-400">
							{playerData.xp}/{playerData.xpToNextLevel} XP
						</span>
					</div>
					<Progress value={xpProgress} className="mt-1 h-1.5" />
				</div>

				{/* Stats */}
				<div className="space-y-2">
					{playerData.stats.map((stat, index) => (
						<div key={index} className="flex items-center gap-2">
							<div className="text-gray-500 dark:text-gray-400">
								{stat.icon}
							</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<span className="text-xs">{stat.name}</span>
									<span className="text-xs font-medium">{stat.value}%</span>
								</div>
								<Progress value={stat.value} className="h-1" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick actions */}
			<div className="border-t border-gray-200 p-3 dark:border-gray-700">
				<div className="flex items-center justify-between text-xs">
					<button className="text-blue-600 hover:underline dark:text-blue-400">
						View Profile
					</button>
					<button className="text-blue-600 hover:underline dark:text-blue-400">
						Skill Detail
					</button>
				</div>
			</div>
		</Card>
	)
}