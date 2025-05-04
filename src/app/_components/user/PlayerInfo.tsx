// src/app/_components/user/PlayerInfo.tsx
"use client"

import { Brain, Shield, Zap, Briefcase, Award, Compass } from "lucide-react"
import { Progress } from "~/components/ui/progress"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"

interface Skill {
	name: string
	value: number
	icon: React.ReactNode
}

interface PlayerInfoProps {
	years: number
	level: number | string
	skills: Skill[]
	description?: string
}

export function PlayerInfo({ years, level, skills, description }: PlayerInfoProps) {
	// Calculate experience progress
	const experienceProgress = Math.min(100, (years / 5) * 100)

	// Find the next skill to develop (lowest value)
	const nextSkillToImprove = [...skills].sort((a, b) => a.value - b.value)[0]

	return (
		<div className="space-y-4">
			{/* Description */}
			{description && (
				<p className="text-sm text-muted-foreground italic mb-4">
					"{description}"
				</p>
			)}

			{/* Experience section */}
			<div className="pb-2">
				<div className="flex items-center justify-between text-sm mb-2">
					<div className="flex items-center gap-1.5">
						<Award className="h-4 w-4 text-primary" />
						<span className="font-medium">Level {level}</span>
					</div>
					<span className="text-xs text-muted-foreground">
						{years} years experience
					</span>
				</div>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Progress value={experienceProgress} className="h-2" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							{experienceProgress.toFixed(0)}% toward next level
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			{/* Skills radar */}
			<div className="space-y-3 pb-3">
				<div className="flex items-center gap-2">
					<Briefcase className="h-4 w-4 text-primary" />
					<h4 className="text-sm font-medium">Core Skills</h4>
				</div>

				<div className="grid grid-cols-1 gap-3">
					{skills.map((skill, index) => (
						<div key={index} className="flex items-center gap-2">
							<div className="text-muted-foreground">
								{skill.icon}
							</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<span className="text-sm">{skill.name}</span>
									<div className="flex items-center gap-1">
										<div className="flex gap-0.5">
											{[1, 2, 3, 4, 5].map((star) => (
												<div
													key={star}
													className={`w-1.5 h-1.5 rounded-full ${star <= Math.round(skill.value / 20)
														? 'bg-primary'
														: 'bg-muted'
														}`}
												/>
											))}
										</div>
										<span className="text-xs font-medium ml-1">{skill.value}%</span>
									</div>
								</div>
								<Progress value={skill.value} className="h-1.5 mt-1.5" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Development suggestion */}
			{nextSkillToImprove && (
				<div className="bg-muted/50 rounded-md p-3 border border-muted">
					<div className="flex items-start gap-2.5">
						<Compass className="h-4 w-4 text-primary mt-0.5" />
						<div>
							<h4 className="text-sm font-medium mb-1">Development Focus</h4>
							<p className="text-xs text-muted-foreground mb-2">
								Consider improving your <span className="font-medium text-foreground">{nextSkillToImprove.name}</span> skills to
								advance your career options.
							</p>
							<Badge variant="outline" className="text-xs px-1.5 py-0">
								{nextSkillToImprove.value}% current proficiency
							</Badge>
						</div>
					</div>
				</div>
			)}

			{/* Quick actions */}
			<div className="pt-2 flex items-center justify-between text-xs">
				<Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
					View Full Profile
				</Button>
				<Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
					Development Journey
				</Button>
			</div>
		</div>
	)
}