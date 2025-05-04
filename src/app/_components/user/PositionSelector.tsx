// src/app/_components/user/PositionSelector.tsx
"use client"

import { useState, useEffect } from "react"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import { useOrganization } from "~/contexts/OrganizationContext"
import { api } from "~/trpc/react"

interface PositionSelectorProps {
	currentPathId?: string
	currentPositionId?: string
	onPathChange: (pathId: string) => void
	onPositionChange: (positionId: string) => void
	className?: string
}

export function PositionSelector({
	currentPathId,
	currentPositionId,
	onPathChange,
	onPositionChange,
	className
}: PositionSelectorProps) {
	const { currentOrganization } = useOrganization()
	const [selectedPathId, setSelectedPathId] = useState<string | undefined>(currentPathId)

	// Fetch career paths
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrganization?.id || "" },
		{ enabled: !!currentOrganization?.id }
	)

	// Fetch positions in the selected path
	const positionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrganization?.id || "",
			careerPathId: selectedPathId || ""
		},
		{ enabled: !!currentOrganization?.id && !!selectedPathId }
	)

	// When paths load and we don't have a current path, select the first one
	useEffect(() => {
		if (pathsQuery.data?.length && !selectedPathId) {
			const firstPathId = pathsQuery.data[0].id
			setSelectedPathId(firstPathId)
			onPathChange(firstPathId)
		}
	}, [pathsQuery.data, selectedPathId, onPathChange])

	// Handle path change
	const handlePathChange = (pathId: string) => {
		setSelectedPathId(pathId)
		onPathChange(pathId)

		// Reset position when path changes
		if (positionsQuery.data?.length) {
			const firstPositionId = positionsQuery.data[0].id
			onPositionChange(firstPositionId)
		}
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{/* Career Path Selector */}
			<Select
				value={selectedPathId}
				onValueChange={handlePathChange}
				disabled={pathsQuery.isLoading}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select career path" />
				</SelectTrigger>
				<SelectContent>
					{pathsQuery.data?.map((path) => (
						<SelectItem key={path.id} value={path.id}>
							{path.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Position Selector */}
			<Select
				value={currentPositionId}
				onValueChange={onPositionChange}
				disabled={positionsQuery.isLoading || !selectedPathId}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select position" />
				</SelectTrigger>
				<SelectContent>
					{positionsQuery.data?.map((detail) => (
						<SelectItem key={detail.id} value={detail.id}>
							{detail.positions?.name || "Unknown Position"} (Level {detail.level})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}