// src/app/skill-tree/page.tsx

"use client"

import { useState } from "react"
import { Navbar } from "~/app/_components/layout/Navbar"
import { Sidebar } from "~/app/_components/layout/Sidebar"
import { Metro } from "~/app/_components/metro/Metro"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "~/components/ui/button"

export default function SkillTreePage() {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="flex h-screen bg-neutral-50 text-gray-900 dark:bg-neutral-900 dark:text-white">
			{/* Collapsible Sidebar */}
			<div
				className={`fixed top-0 left-0 z-30 h-full transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
			>
				<Sidebar />
			</div>

			{/* Sidebar Toggle Button */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed left-4 top-4 z-40 h-10 w-10 rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm dark:bg-neutral-800/80 dark:text-white"
				onClick={() => setSidebarOpen(!sidebarOpen)}
			>
				{sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
			</Button>

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="relative flex-1 overflow-hidden">
					{/* Main Metro Component */}
					<div className="absolute inset-0">
						<Metro />
					</div>
				</main>
			</div>
		</div>
	)
}