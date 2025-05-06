// src/app/destinations/DestinationCard.tsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { type RecommendedDestination, getDestinationTheme } from "./data";
import { cn } from "~/lib/utils";

interface DestinationCardProps {
	destination: RecommendedDestination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
	const theme = getDestinationTheme(destination.theme);

	return (
		<Card
			className={cn(
				"flex h-full flex-col overflow-hidden border-2 transition-shadow hover:shadow-xl dark:bg-neutral-800/50",
				theme.border
			)}
		>
			<div className="relative flex-grow"> {/* Added for subtle gradient positioning */}
				{/* Subtle background gradient element */}
				<div
					className={cn(
						"absolute inset-0 -z-10 opacity-40",
						`bg-gradient-to-r ${theme.gradientFrom} to-transparent`
					)}
				/>
				<CardHeader className="relative p-4 pb-2"> {/* Adjusted padding */}
					<Badge
						variant="default" // Using Shadcn primary color by default
						className="absolute right-4 top-4 bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
					>
						{destination.matchPercentage}% Match
					</Badge>
					<CardTitle className="text-lg font-semibold text-foreground"> {/* Adjusted font size */}
						{destination.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-grow p-4 pt-1"> {/* Adjusted padding */}
					<CardDescription className="mb-4 text-sm text-muted-foreground line-clamp-3">
						{destination.description}
					</CardDescription>

					<div className="mb-4">
						<h4 className="mb-2 text-sm font-medium text-foreground">
							Key Skills
						</h4>
						<div className="flex flex-wrap gap-2">
							{destination.keySkills.map((skill) => (
								<Badge key={skill} variant="secondary" className="text-xs">
									{skill}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</div>
			<CardFooter className="p-4 pt-0"> {/* Adjusted padding */}
				<Button className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90">
					Compare with my role
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}