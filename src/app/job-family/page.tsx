// src/app/job-family/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"
import { supabase } from "~/server/db/supabase"
import { JobFamilyGrid } from "./JobFamilyGrid"
import { DepartmentFilter } from "./DepartmentFilter"
import { SearchBar } from "./SearchBar"

// Type for job family data
export interface JobFamily {
	id: string
	name: string
	description: string
	department: string
	competences?: string[] // Optional as we might fetch this separately
}

export default function JobFamiliesPage() {
	const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [activeTab, setActiveTab] = useState("all")
	const [searchQuery, setSearchQuery] = useState("")

	// Fetch job families from Supabase
	useEffect(() => {
		async function fetchJobFamilies() {
			try {
				setIsLoading(true)

				const { data, error } = await supabase
					.from('job_families')
					.select('*')

				if (error) {
					console.error("Error fetching job families:", error)
					return
				}

				setJobFamilies(data || [])
			} catch (error) {
				console.error("Error in job families fetch:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchJobFamilies()
	}, [])

	// Filter job families based on active tab and search query
	const filteredFamilies = jobFamilies.filter(family => {
		// First filter by department (tab)
		if (activeTab !== "all" && family.department.toLowerCase() !== activeTab) {
			return false
		}

		// Then filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			return (
				family.name.toLowerCase().includes(query) ||
				family.description.toLowerCase().includes(query)
			)
		}

		return true
	})

	// Get unique departments for tabs
	const departments = Array.from(new Set(jobFamilies.map(f => f.department)))

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Job Families</h1>
					<p className="text-muted-foreground">
						Explore career paths and opportunities across the organization
					</p>
				</div>

				{/* Search bar */}
				<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
			</div>

			<DepartmentFilter
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				departments={departments}
			/>

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="h-48 animate-pulse rounded-lg bg-muted"
						/>
					))}
				</div>
			) : (
				<JobFamilyGrid jobFamilies={filteredFamilies} />
			)}
		</div>
	)
}