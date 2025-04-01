// src/app/development/families/JobFamiliesSlider.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, BriefcaseBusiness, Users, Code } from "lucide-react"
import { supabase } from "~/server/db/supabase"

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

interface JobFamiliesSliderProps {
	selectedFamily: string | null
	onSelectFamily: (id: string) => void
}

export default function JobFamiliesSlider({ selectedFamily, onSelectFamily }: JobFamiliesSliderProps) {
	const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const sliderRef = useRef<HTMLDivElement>(null)

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
				// Set first family as selected if none is selected
				if (!selectedFamily && data && data.length > 0) {
					onSelectFamily(data[0].id)
				}
			} catch (error) {
				console.error("Error fetching job families:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchJobFamilies()
	}, [selectedFamily, onSelectFamily])

	// Scroll slider left
	const scrollLeft = () => {
		if (sliderRef.current) {
			sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' })
		}
	}

	// Scroll slider right
	const scrollRight = () => {
		if (sliderRef.current) {
			sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' })
		}
	}

	// Get department color
	const getDepartmentColor = (department: string) => {
		switch (department) {
			case "Product & Technology":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
			case "Commercial":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
			case "People&":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
		}
	}

	// Get department icon
	const getDepartmentIcon = (department: string) => {
		switch (department) {
			case "Product & Technology":
				return <Code className="h-4 w-4" />
			case "Commercial":
				return <BriefcaseBusiness className="h-4 w-4" />
			case "People&":
				return <Users className="h-4 w-4" />
			default:
				return <BriefcaseBusiness className="h-4 w-4" />
		}
	}

	return (
		<div className="relative mb-8 w-full">
			<h2 className="mb-4 text-xl font-semibold">Job Families</h2>

			<div className="relative">
				{/* Left scroll button */}
				<Button
					variant="outline"
					size="icon"
					className="absolute -left-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow-md dark:bg-gray-800"
					onClick={scrollLeft}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Slider container */}
				<div
					ref={sliderRef}
					className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					{isLoading ? (
						// Loading placeholders
						Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-36 w-72 min-w-[18rem] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
							/>
						))
					) : (
						// Job family cards
						jobFamilies.map(family => (
							<Card
								key={family.id}
								className={`flex h-36 w-72 min-w-[18rem] cursor-pointer flex-col justify-between p-4 transition-all hover:shadow-md ${selectedFamily === family.id
										? 'border-2 border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/20'
										: 'bg-white dark:bg-gray-800'
									}`}
								onClick={() => onSelectFamily(family.id)}
							>
								<div>
									<div className="mb-2 flex items-center justify-between">
										<h3 className="font-semibold">{family.name}</h3>
										<span className={`flex items-center rounded-full px-2 py-0.5 text-xs ${getDepartmentColor(family.department)}`}>
											{getDepartmentIcon(family.department)}
											<span className="ml-1">{family.department}</span>
										</span>
									</div>
									<p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-300">
										{family.description}
									</p>
								</div>
								<div className="mt-2">
									<div className={`mt-1 h-1 w-full rounded-full ${selectedFamily === family.id ? 'bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'
										}`} />
								</div>
							</Card>
						))
					)}
				</div>

				{/* Right scroll button */}
				<Button
					variant="outline"
					size="icon"
					className="absolute -right-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow-md dark:bg-gray-800"
					onClick={scrollRight}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}