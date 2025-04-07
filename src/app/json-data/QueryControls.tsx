// src/app/json-data/QueryControls.tsx
"use client"

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "~/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface QueryControlsProps {
	rowLimit: number
	setRowLimit: (limit: number) => void
	queryType: "all" | "sample"
	setQueryType: (type: "all" | "sample") => void
}

export function QueryControls({
	rowLimit,
	setRowLimit,
	queryType,
	setQueryType
}: QueryControlsProps) {
	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<Select
					value={queryType}
					onValueChange={(value) => setQueryType(value as "all" | "sample")}
				>
					<SelectTrigger className="w-[120px]">
						<SelectValue placeholder="Query type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All rows</SelectItem>
						<SelectItem value="sample">Sample (5)</SelectItem>
					</SelectContent>
				</Select>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<InfoIcon className="h-4 w-4 text-muted-foreground" />
						</TooltipTrigger>
						<TooltipContent>
							<p className="max-w-xs text-xs">
								"All rows" shows all records up to the limit.
								"Sample" shows 5 random records for quick exploration.
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Limit:</span>
				<Select
					value={rowLimit.toString()}
					onValueChange={(value) => setRowLimit(parseInt(value))}
				>
					<SelectTrigger className="w-[90px]">
						<SelectValue placeholder="Row limit" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10 rows</SelectItem>
						<SelectItem value="25">25 rows</SelectItem>
						<SelectItem value="50">50 rows</SelectItem>
						<SelectItem value="100">100 rows</SelectItem>
						<SelectItem value="200">200 rows</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}