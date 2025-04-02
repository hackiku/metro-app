// src/app/job-family/SearchBar.tsx
"use client"

import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"

interface SearchBarProps {
	searchQuery: string
	setSearchQuery: (query: string) => void
}

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
	return (
		<div className="relative w-full max-w-sm">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Search job families..."
				className="pl-10"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
		</div>
	)
}