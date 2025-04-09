// src/app/_components/metro/map/components/StationDetailsDialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
// Import both types
import type { Station } from "../../services/dataService"
import type { MetroStation, StationDetail } from "../../types/metro"

// Create a utility function to convert between types if needed
function convertToMetroStation(station: Station): MetroStation {
	return {
		id: station.id,
		name: station.name,
		description: station.description,
		level: station.level,
		x: station.x,
		y: station.y
	};
}

interface StationDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	station: Station | null;
	details: StationDetail | null;
	isLoading: boolean;
	onSetCurrentStation: (station: Station) => void;
}

export function StationDetailsDialog({
	open,
	onOpenChange,
	station,
	details,
	isLoading,
	onSetCurrentStation
}: StationDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-2xl">
				<DialogTitle className="sr-only">Station Details</DialogTitle>

				{isLoading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
						<span className="ml-2">Loading details...</span>
					</div>
				) : station && details ? (
					<>
						<DialogHeader>
							<h2 className="flex items-center text-xl font-semibold">
								{station.name}
								<Badge className="ml-2" variant="outline">Level {station.level}</Badge>
							</h2>
							<DialogDescription>
								{details.description}
							</DialogDescription>
						</DialogHeader>

						<div className="mt-4 space-y-6">
							{/* Skills Section */}
							<div>
								<h3 className="mb-2 font-medium">Key Skills Required</h3>
								{details.skills.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
										{details.skills.map((skill, index) => (
											<div key={index} className="flex items-center p-2 border rounded-md">
												<div className="mr-2">
													<div className="h-3 w-3 rounded-full"
														style={{
															backgroundColor:
																skill.importance >= 4 ? 'var(--destructive)' :
																	skill.importance >= 3 ? 'var(--warning)' :
																		'var(--success)'
														}}
													/>
												</div>
												<div className="text-foreground">{skill.name}</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No specific skills information available</p>
								)}
							</div>

							{/* Development Steps */}
							<div>
								<h3 className="mb-2 font-medium">Development Path</h3>
								{details.developmentSteps.length > 0 ? (
									<div className="space-y-3">
										{details.developmentSteps.map((step, index) => (
											<div key={index} className="p-3 border rounded-md bg-muted/40">
												<div className="flex justify-between items-center mb-1">
													<h4 className="font-medium">{step.name}</h4>
													<Badge>{step.type}</Badge>
												</div>
												<p className="text-sm text-muted-foreground">{step.description}</p>
												<p className="text-xs mt-2">Estimated duration: {step.duration} weeks</p>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No development path information available</p>
								)}
							</div>

							{/* Next Steps Button */}
							<div className="flex justify-end">
								<Button
									onClick={() => station && onSetCurrentStation(station)}
								>
									Set as Current Position
								</Button>
							</div>
						</div>
					</>
				) : (
					<div className="p-6 text-center">
						<p className="text-muted-foreground">Station information not available</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}