// src/app/_components/user/PlayerCard.tsx
"use client"

import { useState } from "react"
import { Brain, Shield, Zap, Star, ChevronUp, ChevronDown, MapPin, Settings, User } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Avatar } from "./Avatar"
import { PlayerInfo } from "./PlayerInfo"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"

interface Role {
	id: string;
	name: string;
	level: number | string;
}

interface UserSkill {
	skillName: string;
	currentLevel: number;
}

interface UserProfile {
	id: string;
	name: string;
	level: string | number;
	years_in_role: number;
	skills: UserSkill[];
	bio?: string;
}

interface PlayerCardProps {
	user: UserProfile;
	currentRole?: Role;
	availablePositions?: Role[];
	onPositionChange?: (positionId: string) => void;
}

export default function PlayerCard({
	user,
	currentRole,
	availablePositions = [],
	onPositionChange
}: PlayerCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	// Group skills by category for visualization
	const skillsByCategory = user.skills.reduce((acc, skill) => {
		// Extract category from skill name or default to "Technical"
		let category = "Technical";
		if (skill.skillName.toLowerCase().includes("leadership") ||
			skill.skillName.toLowerCase().includes("management")) {
			category = "Leadership";
		} else if (skill.skillName.toLowerCase().includes("communication") ||
			skill.skillName.toLowerCase().includes("interpersonal")) {
			category = "Soft Skills";
		} else if (skill.skillName.toLowerCase().includes("domain") ||
			skill.skillName.toLowerCase().includes("business")) {
			category = "Domain Knowledge";
		}

		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(skill);
		return acc;
	}, {} as Record<string, typeof user.skills>);

	// Calculate aggregated skill scores by category
	const skillScores = Object.entries(skillsByCategory).map(([category, skills]) => {
		const avgScore = skills.reduce((sum, skill) => sum + (skill.currentLevel || 0), 0) / skills.length;
		const percentage = (avgScore / 5) * 100; // Assuming proficiency is on a 1-5 scale

		let icon = <Star className="h-4 w-4" />;
		if (category.toLowerCase().includes('technical')) {
			icon = <Brain className="h-4 w-4" />;
		} else if (category.toLowerCase().includes('soft')) {
			icon = <Zap className="h-4 w-4" />;
		} else if (category.toLowerCase().includes('leadership')) {
			icon = <Shield className="h-4 w-4" />;
		}

		return {
			name: category,
			value: Math.round(percentage),
			icon
		};
	});

	// For collapsed state, show only the avatar with level indicator
	if (!isExpanded) {
		return (
			<div className="absolute top-4 left-4 z-10">
				<Avatar
					src="" // You can add a default avatar URL here
					name={user.name}
					level={currentRole?.level || 1}
					isExpanded={false}
					onClick={() => setIsExpanded(true)}
				/>
			</div>
		);
	}

	return (
		<div className="absolute top-4 left-4 z-10">
			<Card className="w-80 overflow-hidden bg-background/95 shadow-lg backdrop-blur-sm border-primary/10">
				{/* Header section - entire header is clickable to collapse */}
				<div
					className="flex items-center justify-between p-4 bg-muted/60 cursor-pointer hover:bg-muted transition-colors"
					onClick={() => setIsExpanded(false)}
				>
					<div className="flex items-center gap-3">
						<Avatar
							src="" // You can add a default avatar URL here
							name={user.name}
							level={currentRole?.level || 1}
							isExpanded={true}
							onClick={() => { }}
						/>

						<div>
							<h3 className="font-semibold">{user.name}</h3>
							<div className="flex items-center justify-between w-full">
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<MapPin className="h-3 w-3" />
									<span>{currentRole?.name || "Position not set"}</span>
								</div>
							</div>
						</div>
					</div>

					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</div>

				{/* User bio section */}
				{user.bio && (
					<div className="px-4 pt-3 pb-1">
						<p className="text-sm text-muted-foreground italic">"{user.bio}"</p>
					</div>
				)}

				{/* Position selector (for debugging) */}
				{onPositionChange && availablePositions.length > 0 && (
					<div className="px-4 py-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="w-full justify-between">
									<div className="flex items-center gap-1.5">
										<Settings className="h-3.5 w-3.5" />
										<span>Change Position</span>
									</div>
									<ChevronDown className="h-3.5 w-3.5 opacity-50" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-72">
								<DropdownMenuLabel>Select Current Position</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{availablePositions.map((position) => (
									<DropdownMenuItem
										key={position.id}
										onClick={() => onPositionChange(position.id)}
										className={currentRole?.id === position.id ? "bg-primary/10" : ""}
									>
										<div className="flex items-center justify-between w-full">
											<span>{position.name}</span>
											<span className="text-xs text-muted-foreground">Level {position.level}</span>
										</div>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}

				<CardContent className="p-4">
					<PlayerInfo
						years={user.years_in_role}
						level={currentRole?.level || 1}
						skills={skillScores}
						description={user.bio || "Career-focused professional seeking to develop technical and leadership skills."}
					/>
				</CardContent>
			</Card>
		</div>
	);
}