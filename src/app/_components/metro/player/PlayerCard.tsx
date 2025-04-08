// src/app/_components/metro/player/PlayerCard.tsx
"use client"

import { useState, useEffect } from "react"
import { User, Brain, Shield, Zap, Star, ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { supabase } from "~/server/db/supabase"

interface UserSkill {
	id: string
	skill_id: string
	proficiency_level: number
	skill_name?: string
	skill_type?: string
}

interface UserData {
	id: string
	name: string
	current_station_id: string
	years_experience: number
	profile_description: string
	avatar_url: string
	station_name?: string
	station_level?: number
}

export function PlayerCard() {
	const [isExpanded, setIsExpanded] = useState(true)
	const [userData, setUserData] = useState<UserData | null>(null)
	const [userSkills, setUserSkills] = useState<UserSkill[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchUserData() {
			try {
				setIsLoading(true)

				// Fetch demo user (in a real app, this would be the current authenticated user)
				const { data: userDataResponse, error: userError } = await supabase
					.schema('gasunie')
					.from('demo_users')
					.select(`
            id, 
            name, 
            current_station_id,
            years_experience,
            profile_description,
            avatar_url
          `)
					.single()

				if (userError || !userDataResponse) {
					console.error('Error fetching user data:', userError)
					return
				}

				// Create a proper UserData object
				const userDataObject: UserData = {
					id: userDataResponse.id,
					name: userDataResponse.name,
					current_station_id: userDataResponse.current_station_id,
					years_experience: userDataResponse.years_experience,
					profile_description: userDataResponse.profile_description,
					avatar_url: userDataResponse.avatar_url,
				};

				// Get station details
				if (userDataObject.current_station_id) {
					const { data: stationData } = await supabase
						.schema('gasunie')
						.from('metro_stations')
						.select('name, job_level_id')
						.eq('id', userDataObject.current_station_id)
						.single()

					if (stationData) {
						userDataObject.station_name = stationData.name

						// Get job level
						if (stationData.job_level_id) {
							const { data: levelData } = await supabase
								.schema('gasunie')
								.from('job_levels')
								.select('level_number')
								.eq('id', stationData.job_level_id)
								.single()

							if (levelData) {
								userDataObject.station_level = levelData.level_number
							}
						}
					}
				}

				setUserData(userDataObject)

				// Fetch user skills
				if (userDataObject.id) {
					const { data: skillsData, error: skillsError } = await supabase
						.schema('gasunie')
						.from('user_skills')
						.select(`
              id,
              skill_id,
              proficiency_level
            `)
						.eq('user_id', userDataObject.id)

					if (skillsError) {
						console.error('Error fetching user skills:', skillsError)
						return
					}

					// Get skill details
					if (skillsData && skillsData.length > 0) {
						const skillIds = skillsData.map(skill => skill.skill_id)

						const { data: skillDetails } = await supabase
							.schema('gasunie')
							.from('skills')
							.select('id, name, skill_type')
							.in('id', skillIds)

						if (skillDetails) {
							const enhancedSkills = skillsData.map(skill => {
								const details = skillDetails.find(d => d.id === skill.skill_id)
								return {
									...skill,
									skill_name: details?.name,
									skill_type: details?.skill_type
								}
							})

							setUserSkills(enhancedSkills)
						}
					}
				}
			} catch (error) {
				console.error('Error loading user data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchUserData()
	}, [])

	// The rest of the component remains the same...

	// Calculate progress level for XP (simulated)
	const currentLevel = userData?.station_level || 1
	const years = userData?.years_experience || 0
	const experienceProgress = Math.min(100, (years / 5) * 100)

	// Group skills by type for visualization
	const skillsByType = userSkills.reduce((acc, skill) => {
		const type = skill.skill_type || 'Technical'
		if (!acc[type]) {
			acc[type] = []
		}
		acc[type].push(skill)
		return acc
	}, {} as Record<string, UserSkill[]>)

	// Calculate aggregated skill scores by type
	const skillScores = Object.entries(skillsByType).map(([type, skills]) => {
		const avgScore = skills.reduce((sum, skill) => sum + (skill.proficiency_level || 0), 0) / skills.length
		const percentage = (avgScore / 5) * 100 // Assuming proficiency is on a 1-5 scale

		let icon = <Star className="h-4 w-4" />
		if (type.toLowerCase().includes('technical')) {
			icon = <Brain className="h-4 w-4" />
		} else if (type.toLowerCase().includes('soft') || type.toLowerCase().includes('interpersonal')) {
			icon = <Zap className="h-4 w-4" />
		} else if (type.toLowerCase().includes('lead') || type.toLowerCase().includes('management')) {
			icon = <Shield className="h-4 w-4" />
		}

		return {
			name: type,
			value: Math.round(percentage),
			icon
		}
	})

	// For collapsed state, show only the avatar
	if (!isExpanded) {
		return (
			<div className="absolute top-4 left-4 z-10">
				<Button
					variant="outline"
					size="icon"
					className="h-12 w-12 rounded-full bg-background/80 p-0 backdrop-blur-sm"
					onClick={() => setIsExpanded(true)}
				>
					<Avatar className="h-10 w-10">
						<AvatarImage src={userData?.avatar_url || ""} alt={userData?.name || "User"} />
						<AvatarFallback>{userData?.name?.charAt(0) || "U"}</AvatarFallback>
					</Avatar>
				</Button>
			</div>
		)
	}

	return (
		<div className="absolute top-4 left-4 z-10">
			<Card className="w-64 overflow-hidden bg-background/90 shadow-lg backdrop-blur-sm">
				<div className="flex justify-between bg-primary p-3 text-primary-foreground">
					<div className="flex items-center gap-3">
						<Avatar className="h-12 w-12 border-2 border-primary-foreground">
							<AvatarImage src={userData?.avatar_url || ""} alt={userData?.name || "User"} />
							<AvatarFallback>{userData?.name?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>

						<div>
							<h3 className="font-semibold">{userData?.name || "Loading..."}</h3>
							<p className="text-xs opacity-90">{userData?.station_name || "Position loading..."}</p>
						</div>
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 self-start text-primary-foreground/80 hover:text-primary-foreground"
						onClick={() => setIsExpanded(false)}
					>
						<ChevronUp className="h-4 w-4" />
					</Button>
				</div>

				<div className="p-3">
					{/* Level and Experience */}
					<div className="mb-3">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">Level {currentLevel}</span>
							<span className="text-xs text-muted-foreground">
								{userData?.years_experience || 0} years experience
							</span>
						</div>
						<Progress value={experienceProgress} className="mt-1 h-1.5" />
					</div>

					{/* Skills */}
					<div className="space-y-2">
						{skillScores.map((stat, index) => (
							<div key={index} className="flex items-center gap-2">
								<div className="text-muted-foreground">
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

					{/* Brief description */}
					{userData?.profile_description && (
						<p className="mt-3 text-xs italic text-muted-foreground">
							"{userData.profile_description}"
						</p>
					)}
				</div>

				{/* Quick actions */}
				<div className="border-t p-3 dark:border-gray-800">
					<div className="flex items-center justify-between text-xs">
						<Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
							View Profile
						</Button>
						<Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
							Development Plan
						</Button>
					</div>
				</div>
			</Card>
		</div>
	)
}