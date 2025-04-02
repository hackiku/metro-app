// src/app/development/families/JobFamiliesSlider.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "~/server/db/supabase"
import FamilyCard from "./FamilyCard"
import FamilyModal from "./FamilyModal"

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
	const [selectedFamilyDetails, setSelectedFamilyDetails] = useState<JobFamily | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const sliderRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [scrollLeft, setScrollLeft] = useState(0)

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

	// Handle mousedown for slider dragging
	const handleMouseDown = (e: React.MouseEvent) => {
		if (sliderRef.current) {
			setIsDragging(true)
			setStartX(e.pageX - sliderRef.current.offsetLeft)
			setScrollLeft(sliderRef.current.scrollLeft)
		}
	}

	// Handle mousemove for slider dragging
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return
		e.preventDefault()
		if (sliderRef.current) {
			const x = e.pageX - sliderRef.current.offsetLeft
			const walk = (x - startX) * 2 // Scroll speed multiplier
			sliderRef.current.scrollLeft = scrollLeft - walk
		}
	}

	// Handle mouseup/mouseleave for slider dragging
	const handleDragEnd = () => {
		setIsDragging(false)
	}

	// Show details modal for a family
	const showFamilyDetails = (family: JobFamily) => {
		setSelectedFamilyDetails(family)
		setIsModalOpen(true)
	}

	return (
		<div className="mb-8 w-full">
			<h2 className="mb-4 text-xl font-semibold">Job Families</h2>

			{/* Slider container */}
			<div
				ref={sliderRef}
				className={`flex cursor-grab space-x-4 overflow-x-auto pb-4 scrollbar-hide ${isDragging ? "cursor-grabbing" : ""}`}
				style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', userSelect: 'none' }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleDragEnd}
				onMouseLeave={handleDragEnd}
			>
				{isLoading ? (
					// Loading placeholders
					Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="h-40 w-72 min-w-[18rem] animate-pulse rounded-lg bg-muted"
						/>
					))
				) : (
					// Job family cards
					jobFamilies.map(family => (
						<FamilyCard
							key={family.id}
							family={family}
							isSelected={selectedFamily === family.id}
							onSelect={onSelectFamily}
							onShowDetails={showFamilyDetails}
						/>
					))
				)}
			</div>

			{/* Family details modal */}
			<FamilyModal
				family={selectedFamilyDetails}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			/>
		</div>
	)
}