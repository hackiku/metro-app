// src/app/json-data/TableSelector.tsx
"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
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
import { useState } from "react"

interface TableSelectorProps {
	tables: string[]
	selectedTable: string
	onSelectTable: (table: string) => void
}

export function TableSelector({ tables, selectedTable, onSelectTable }: TableSelectorProps) {
	const [open, setOpen] = useState(false)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[220px] justify-between"
				>
					{selectedTable ? selectedTable : "Select table..."}
					{/* {selectedTable ? `gasunie.${selectedTable}` : "Select table..."} */}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[220px] p-0">
				<Command>
					<CommandInput placeholder="Search tables..." />
					<CommandEmpty>No table found.</CommandEmpty>
					<CommandGroup>
						{tables.map((table) => (
							<CommandItem
								key={table}
								value={table}
								onSelect={() => {
									onSelectTable(table)
									setOpen(false)
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										selectedTable === table ? "opacity-100" : "opacity-0"
									)}
								/>
								gasunie.{table}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	)
}