// src/app/destinations/components/ContextDataDisplay.tsx
"use client";

import { useEffect, useState } from "react";
import { CopyJsonButton } from "./CopyJsonButton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

interface ContextDataDisplayProps {
	user: any;
	organization: any;
	userCompetences: any[];
	currentPosition: any;
	plans: any[];
	activePlan: any;
	recommendations: any[];
}

export function ContextDataDisplay({
	user,
	organization,
	userCompetences,
	currentPosition,
	plans,
	activePlan,
	recommendations
}: ContextDataDisplayProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!isExpanded) {
		return (
			<div className="mb-6 rounded-lg border bg-card p-2 text-card-foreground">
				<button
					onClick={() => setIsExpanded(true)}
					className="w-full text-left p-2 text-sm text-primary hover:underline"
				>
					Show Context Data (Development Mode)
				</button>
			</div>
		);
	}

	return (
		<div className="mb-6 rounded-lg border bg-card p-4 text-card-foreground">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold">Context Data (Development Mode)</h2>
				<button
					onClick={() => setIsExpanded(false)}
					className="text-sm text-primary hover:underline"
				>
					Hide
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* User Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 p-3">
						<div className="flex justify-between items-center">
							<CardTitle className="text-md font-medium">Current User</CardTitle>
							<CopyJsonButton jsonData={user} tooltipText="Copy User Data" />
						</div>
					</CardHeader>
					<CardContent className="p-3 text-sm">
						{user ? (
							<div className="space-y-1">
								<p><span className="font-medium">Name:</span> {user.full_name}</p>
								<p><span className="font-medium">Email:</span> {user.email}</p>
								<p><span className="font-medium">Role:</span> {user.role}</p>
								<p><span className="font-medium">Level:</span> {user.level}</p>
								<p><span className="font-medium">Years in Role:</span> {user.years_in_role}</p>
							</div>
						) : (
							<p className="text-muted-foreground">No user selected</p>
						)}
					</CardContent>
				</Card>

				{/* Organization Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 p-3">
						<div className="flex justify-between items-center">
							<CardTitle className="text-md font-medium">Organization</CardTitle>
							<CopyJsonButton jsonData={organization} tooltipText="Copy Organization Data" />
						</div>
					</CardHeader>
					<CardContent className="p-3 text-sm">
						{organization ? (
							<div className="space-y-1">
								<p><span className="font-medium">Name:</span> {organization.name}</p>
								<p><span className="font-medium">ID:</span> <span className="text-xs font-mono">{organization.id}</span></p>
								{organization.primary_color && (
									<div className="flex items-center gap-2">
										<span className="font-medium">Primary Color:</span>
										<div
											className="h-4 w-4 rounded-full border"
											style={{ backgroundColor: organization.primary_color }}
										></div>
										<span>{organization.primary_color}</span>
									</div>
								)}
							</div>
						) : (
							<p className="text-muted-foreground">No organization selected</p>
						)}
					</CardContent>
				</Card>

				{/* Current Position Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 p-3">
						<div className="flex justify-between items-center">
							<CardTitle className="text-md font-medium">Current Position</CardTitle>
							<CopyJsonButton jsonData={currentPosition} tooltipText="Copy Position Data" />
						</div>
					</CardHeader>
					<CardContent className="p-3 text-sm">
						{currentPosition ? (
							<div className="space-y-1">
								<p><span className="font-medium">Position:</span> {currentPosition.position?.name}</p>
								<p><span className="font-medium">Path:</span> {currentPosition.career_path?.name}</p>
								<p><span className="font-medium">Level:</span> {currentPosition.level}</p>
								{currentPosition.path_specific_description && (
									<p className="text-xs text-muted-foreground mt-2">{currentPosition.path_specific_description}</p>
								)}
							</div>
						) : (
							<p className="text-muted-foreground">No position data</p>
						)}
					</CardContent>
				</Card>

				{/* User Competences Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 p-3">
						<div className="flex justify-between items-center">
							<CardTitle className="text-md font-medium">User Competences</CardTitle>
							<CopyJsonButton jsonData={userCompetences} tooltipText="Copy Competences Data" />
						</div>
					</CardHeader>
					<CardContent className="p-3 text-sm">
						{userCompetences && userCompetences.length > 0 ? (
							<div className="space-y-2">
								<p><span className="font-medium">Count:</span> {userCompetences.length}</p>
								<div className="flex flex-wrap gap-1">
									{userCompetences.slice(0, 5).map((comp) => (
										<Badge key={comp.id} variant="outline" className="text-xs">
											{comp.competence.name} ({comp.current_level}/5)
										</Badge>
									))}
									{userCompetences.length > 5 && <Badge variant="outline">+{userCompetences.length - 5} more</Badge>}
								</div>
							</div>
						) : (
							<p className="text-muted-foreground">No competence data</p>
						)}
					</CardContent>
				</Card>

				{/* Career Plans Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 p-3">
						<div className="flex justify-between items-center">
							<CardTitle className="text-md font-medium">Career Plans</CardTitle>
							<CopyJsonButton jsonData={{ plans, activePlan }} tooltipText="Copy Plans Data" />
						</div>
					</CardHeader>
					<CardContent className="p-3 text-sm">
						{plans && plans.length > 0 ? (
							<div className="space-y-2">
								<p><span className="font-medium">Count:</span> {plans.length}</p>
								<p><span className="font-medium">Active Plan:</span> {activePlan ? "Yes" : "No"}</p>
								{activePlan && (
									<div className="mt-2">
										<p><span className="font-medium">Target:</span> {activePlan.target_position_details?.positions?.name}</p>
										<p><span className="font-medium">Status:</span> {activePlan.status}</p>
										<p><span className="font-medium">Duration:</span> {activePlan.estimated_total_duration || "Not set"}</p>
									</div>
								)}
							</div>
						) : (
							<p className="text-muted-foreground">No career plan data</p>
						)}
					</CardContent>
				</Card>

				{/* Recommendations Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 p-3">
						<div className="flex justify-between items-center">
							<CardTitle className="text-md font-medium">Recommendations</CardTitle>
							<CopyJsonButton jsonData={recommendations} tooltipText="Copy Recommendations Data" />
						</div>
					</CardHeader>
					<CardContent className="p-3 text-sm">
						{recommendations && recommendations.length > 0 ? (
							<div className="space-y-2">
								<p><span className="font-medium">Count:</span> {recommendations.length}</p>
								<div className="flex flex-wrap gap-1">
									{recommendations.slice(0, 3).map((rec) => (
										<Badge key={rec.id} variant="outline" className="text-xs">
											{rec.title} ({rec.matchPercentage}%)
										</Badge>
									))}
									{recommendations.length > 3 && <Badge variant="outline">+{recommendations.length - 3} more</Badge>}
								</div>
							</div>
						) : (
							<p className="text-muted-foreground">No recommendation data</p>
						)}
					</CardContent>
				</Card>
			</div>

			<Separator className="my-4" />

			<p className="text-xs text-muted-foreground">
				Note: This panel is only visible in development mode and helps visualize the available data for debugging purposes.
			</p>
		</div>
	);
}