"use client"

// src/app/_components/metro/ui/player/PlayerCard.tsx
import { useState } from "react"
import { Brain, Shield, Zap, Star, ChevronUp, MapPin } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Avatar } from "./Avatar"
import { PlayerInfo } from "./PlayerInfo"
import type { Role, UserProfile } from "../../types"

interface PlayerCardProps {
	user: UserProfile;
	currentRole?: Role;
}

export default function PlayerCard({ user, currentRole }: PlayerCardProps) {
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
			<Card className="w-72 overflow-hidden bg-background/95 shadow-lg backdrop-blur-sm border-primary/10">
				{/* Header section - entire header is clickable to collapse */}
				<div
					className="flex items-center justify-between p-4 -mt-6 bg-muted/60 cursor-pointer hover:bg-muted transition-colors"
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
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								<MapPin className="h-3 w-3" />
								<span>{currentRole?.name || "Position not set"}</span>
							</div>
						</div>
					</div>

					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				</div>

				<CardContent className="p-3 pt-1">
					<PlayerInfo
						years={5} // This would come from user data in a real implementation
						level={currentRole?.level || 1}
						skills={skillScores}
						description={"Career-focused professional seeking to develop technical and leadership skills."}
					/>
				</CardContent>
			</Card>
		</div>
	);
}