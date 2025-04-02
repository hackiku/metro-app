// src/app/job-family/DepartmentFilter.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

interface DepartmentFilterProps {
	activeTab: string
	setActiveTab: (tab: string) => void
	departments: string[]
}

export function DepartmentFilter({
	activeTab,
	setActiveTab,
	departments
}: DepartmentFilterProps) {
	// Department display names (for tabs)
	const departmentLabels: Record<string, string> = {
		"People&": "People & Support",
		"Product & Technology": "Product & Tech",
		"Commercial": "Commercial"
	}

	// Normalize department name to tab id
	const getDepartmentId = (dept: string): string => {
		return dept.toLowerCase().replace(/[^a-z0-9]/g, '')
	}

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
			<TabsList className="bg-muted">
				<TabsTrigger value="all">All Families</TabsTrigger>

				{departments.map((dept) => (
					<TabsTrigger
						key={dept}
						value={getDepartmentId(dept)}
					>
						{departmentLabels[dept] || dept}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	)
}