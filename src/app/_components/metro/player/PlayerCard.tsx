// src/app/_components/metro/player/PlayerCard.tsx
"use client"

import { useState, useEffect } from "react"
import { Brain, Shield, Zap, Star, ChevronUp, MapPin } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Avatar } from "./Avatar"
import { PlayerInfo } from "./PlayerInfo"
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
	const [isExpanded, setIsExpanded] = useState(false)
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

	// For collapsed state, show only the avatar with level indicator
	if (!isExpanded) {
		return (
			<div className="absolute top-4 left-4 z-10">
				<Avatar
					src={userData?.avatar_url}
					name={userData?.name}
					level={userData?.station_level}
					isExpanded={false}
					onClick={() => setIsExpanded(true)}
				/>
			</div>
		)
	}

	return (
		<div className="absolute top-4 left-4 z-10">
			<Card className="w-72 overflow-hidden bg-background/95 shadow-lg backdrop-blur-sm border-primary/10">
				{/* Header section - entire header is clickable to collapse */}
				<div
					className="flex items-center justify-between p-4 -mt-6 bg-muted/60 cursor-pointer hover:bg-muted transition-colors"
					onClick={() => setIsExpanded(false)}
				>
					<div className="flex items-center gap-3">
						<Avatar
							src={userData?.avatar_url}
							name={userData?.name}
							level={userData?.station_level}
							isExpanded={true}
							onClick={() => { }}
						/>

						<div>
							<h3 className="font-semibold">{userData?.name || "Loading..."}</h3>
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								<MapPin className="h-3 w-3" />
								<span>{userData?.station_name || "Position loading..."}</span>
							</div>
						</div>
					</div>

					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				</div>

				<CardContent className="p-3 pt-1">
					<PlayerInfo
						years={userData?.years_experience || 0}
						level={userData?.station_level || 1}
						skills={skillScores}
						description={userData?.profile_description}
					/>
				</CardContent>
			</Card>
		</div>
	)
}