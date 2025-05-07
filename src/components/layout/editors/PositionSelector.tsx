// src/components/layout/editors/PositionSelector.tsx

"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "~/lib/utils"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "~/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

interface PositionSelectorProps {
	value: string | null
	onChange: (value: string | null) => void
	organizationId: string
	positions?: any[] // Pre-fetched positions passed down from parent
}

export function PositionSelector({ value, onChange, organizationId, positions }: PositionSelectorProps) {
	const [open, setOpen] = useState(false)

	// Only fetch positions if they're not provided
	const { data: fetchedPositions, isLoading } = api.position.getAllDetails.useQuery(
		{ organizationId },
		{
			enabled: !!organizationId && !positions,
			staleTime: 5 * 60 * 1000
		}
	)

	// Use provided positions or fetched ones
	const positionDetails = positions || fetchedPositions || []

	// Find the selected position for display
	const selectedPosition = positionDetails.find(pos => pos.id === value)

	// Group positions by career path for better organization
	const positionsByPath: Record<string, any[]> = {}

	positionDetails.forEach(pos => {
		const pathId = pos.career_path_id
		const pathName = pos.career_paths?.name || 'Other'

		if (!positionsByPath[pathId]) {
			positionsByPath[pathId] = []
		}

		positionsByPath[pathId].push(pos)
	})

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between h-10 text-left font-normal"
				>
					{value && selectedPosition ? (
						<span className="truncate">
							{selectedPosition.positions?.name} ({selectedPosition.level}) - {selectedPosition.career_paths?.name}
						</span>
					) : (
						<span className="text-muted-foreground">Select a position...</span>
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="Search positions..." />
					<CommandEmpty>
						{isLoading ? "Loading..." : "No position found."}
					</CommandEmpty>

					{Object.entries(positionsByPath).map(([pathId, positions]) => {
						// Skip empty paths
						if (positions.length === 0) return null

						// Get path name from first position
						const pathName = positions[0].career_paths?.name || 'Other'

						return (
							<CommandGroup key={pathId} heading={pathName}>
								{positions.map((position) => (
									<CommandItem
										key={position.id}
										value={`${position.id}-${position.positions?.name}-${position.level}`}
										onSelect={() => {
											onChange(position.id === value ? null : position.id)
											setOpen(false)
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === position.id ? "opacity-100" : "opacity-0"
											)}
										/>
										<span className="truncate">
											{position.positions?.name} (Level {position.level})
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						)
					})}

					{/* Option to clear selection */}
					{value && (
						<CommandGroup>
							<CommandItem
								onSelect={() => {
									onChange(null)
									setOpen(false)
								}}
								className="text-muted-foreground"
							>
								Clear selection
							</CommandItem>
						</CommandGroup>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	)
}