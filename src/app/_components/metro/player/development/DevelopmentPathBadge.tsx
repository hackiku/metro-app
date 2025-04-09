// src/app/_components/metro/development/DevelopmentPathBadge.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Map, Calendar, ArrowRight } from "lucide-react"
import { fetchDevelopmentPath } from "../services/developmentService"
import type { MetroStation } from "../types/metro"

interface DevelopmentPathBadgeProps {
	fromStation: MetroStation;
	toStation: MetroStation;
	onViewDetails: () => void;
	schema?: string;
}

export function DevelopmentPathBadge({
	fromStation,
	toStation,
	onViewDetails,
	schema = 'gasunie'
}: DevelopmentPathBadgeProps) {
	const [monthsEstimate, setMonthsEstimate] = useState<number>(0);
	const [difficulty, setDifficulty] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadPathData() {
			try {
				setIsLoading(true);
				const pathData = await fetchDevelopmentPath(fromStation.id, toStation.id, schema);

				if (pathData) {
					setMonthsEstimate(pathData.estimatedMonths);
					setDifficulty(pathData.difficulty);
				} else {
					// Default fallback values
					setMonthsEstimate(12);
					setDifficulty(3);
				}
			} catch (error) {
				console.error("Error fetching path data:", error);
				// Default fallback values
				setMonthsEstimate(12);
				setDifficulty(3);
			} finally {
				setIsLoading(false);
			}
		}

		loadPathData();
	}, [fromStation.id, toStation.id, schema]);

	// Helper to determine difficulty color
	const getDifficultyColor = (level: number) => {
		if (level <= 2) return "text-green-500";
		if (level <= 3) return "text-amber-500";
		return "text-red-500";
	};

	return (
		<div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform rounded-lg bg-background/95 p-3 shadow-md backdrop-blur-sm">
			<div className="flex items-center gap-2 text-sm">
				<span className="font-medium">{fromStation.name}</span>
				<ArrowRight className="h-4 w-4 text-muted-foreground" />
				<span className="font-medium">{toStation.name}</span>
			</div>

			<div className="mt-2 flex items-center gap-4 text-xs">
				<div className="flex items-center gap-1">
					<Calendar className="h-3 w-3 text-muted-foreground" />
					<span>{isLoading ? "..." : `${monthsEstimate} months`}</span>
				</div>

				<div className="flex items-center gap-1">
					<span>Difficulty:</span>
					<span className={getDifficultyColor(difficulty)}>
						{isLoading ? "..." : "●".repeat(difficulty)}
					</span>
				</div>
			</div>

			<Button
				size="sm"
				onClick={onViewDetails}
				className="mt-2 w-full"
			>
				<Map className="mr-2 h-3 w-3" />
				View Development Plan
			</Button>
		</div>
	);
}