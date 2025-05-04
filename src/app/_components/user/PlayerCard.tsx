// src/app/_components/user/PlayerCard.tsx
"use client"

import { useState } from "react"
import { Brain, Shield, Zap, ChevronUp, ChevronDown } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Avatar } from "./Avatar"
import { PlayerInfo } from "./PlayerInfo"
import { PositionSelector } from "./PositionSelector"
import { useUser } from "~/contexts/UserContext"
import { api } from "~/trpc/react"

interface PlayerCardProps {
	currentPositionId?: string | null;
	onPositionChange?: (positionId: string) => void;
}

export default function PlayerCard({ currentPositionId, onPositionChange }: PlayerCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedPathId, setSelectedPathId] = useState<string | undefined>();
	const { currentUser } = useUser();

	// Fetch user skills (competences)
	const userCompetencesQuery = api.user.getUserCompetences.useQuery(
		{ userId: currentUser?.id || "" },
		{
			enabled: !!currentUser?.id,
			// Fallback silently if the endpoint doesn't exist
			onError: () => console.log("User competences query not implemented yet")
		}
	);

	// Process competences or use fallback skills
	const skills = userCompetencesQuery.data ?
		userCompetencesQuery.data.map(comp => ({
			name: comp.name || "Skill",
			value: comp.current_level || 50,
			icon: comp.category === "technical" ? <Brain className="h-4 w-4" /> :
				comp.category === "leadership" ? <Shield className="h-4 w-4" /> :
					<Zap className="h-4 w-4" />
		})) :
		[
			{ name: "Technical", value: 75, icon: <Brain className="h-4 w-4" /> },
			{ name: "Leadership", value: 58, icon: <Shield className="h-4 w-4" /> },
			{ name: "Communication", value: 82, icon: <Zap className="h-4 w-4" /> },
			{ name: "Domain Knowledge", value: 68, icon: <Zap className="h-4 w-4" /> },
		];

	// Get user basic details with fallbacks
	const userName = currentUser?.full_name || "User";
	const userEmail = currentUser?.email || "user@example.com";
	const userLevel = currentUser?.level || "Junior";
	const yearsInRole = currentUser?.years_in_role || 1;

	// Handle position change
	const handlePositionChange = (positionId: string) => {
		if (onPositionChange) {
			onPositionChange(positionId);
		}
	};

	// Handle path change
	const handlePathChange = (pathId: string) => {
		setSelectedPathId(pathId);
	};

	// Collapsed state
	if (!isExpanded) {
		return (
			<div className="absolute top-4 left-4 z-10">
				<Avatar
					name={userName}
					level={userLevel}
					isExpanded={false}
					onClick={() => setIsExpanded(true)}
				/>
			</div>
		);
	}

	// Expanded state
	return (
		<div className="absolute top-4 left-4 z-10 max-w-80">
			<Card className="overflow-hidden bg-background/95 shadow-lg backdrop-blur-sm border-primary/10">
				{/* Header section - clickable to collapse */}
				<div
					className="flex items-center justify-between p-4 bg-muted/60 cursor-pointer hover:bg-muted transition-colors"
					onClick={() => setIsExpanded(false)}
				>
					<div className="flex items-center gap-3">
						<Avatar
							name={userName}
							level={userLevel}
							isExpanded={true}
							onClick={() => { }}
						/>

						<div>
							<h3 className="font-semibold">{userName}</h3>
							<div className="text-xs text-muted-foreground mt-0.5">
								{userEmail}
							</div>
						</div>
					</div>

					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</div>

				{/* Position selector */}
				<div className="px-4 py-3 bg-muted/30 border-y border-border/50">
					<PositionSelector
						currentPathId={selectedPathId}
						currentPositionId={currentPositionId || undefined}
						onPathChange={handlePathChange}
						onPositionChange={handlePositionChange}
					/>
				</div>

				<CardContent className="p-4">
					<PlayerInfo
						years={yearsInRole}
						level={userLevel}
						skills={skills}
						description="Career-focused professional seeking to develop technical and leadership skills."
					/>
				</CardContent>
			</Card>
		</div>
	);
}