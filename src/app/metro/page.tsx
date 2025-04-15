// src/app/metro/page.tsx
"use client"

import { useState, useEffect } from "react"
import CareerCompass from "~/app/_components/metro/CareerCompass"

export default function MetroPage() {
	const [activeTab, setActiveTab] = useState("technical")
	const [isClient, setIsClient] = useState(false)

	// Ensure Metro is only rendered client-side to avoid hydration issues
	useEffect(() => {
		setIsClient(true)
	}, [])

	return (
		<div className="relative h-full">
			{/* Main Metro Component - only render on client side */}
			{isClient && (
				<div className="absolute inset-0">
					<CareerCompass />
				</div>
			)}
		</div>
	)
}