// ~/app/_components/layout/Navbar.tsx

"use client"

import Link from "next/link"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { Search, Bell, User } from "lucide-react"
import { Button } from "~/components/ui/button"

export function Navbar() {
	return (
		<nav className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
			<div className="flex items-center gap-2">
				<Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
					Metro Map
				</Link>
			</div>

			<div className="flex items-center space-x-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
					<input
						type="text"
						placeholder="Search..."
						className="h-9 w-64 rounded-md border border-gray-300 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
					/>
				</div>

				<Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
					<Bell className="h-5 w-5" />
				</Button>

				<ModeToggle />

				<Button variant="ghost" size="icon" className="rounded-full text-gray-700 dark:text-gray-300">
					<User className="h-5 w-5" />
				</Button>
			</div>
		</nav>
	)
}