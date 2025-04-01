//src/app/_components/layout/Sidebar.tsx

"use client"

import Link from "next/link"
import {
	Play,
	Home,
	Layers,
	Award,
	Briefcase,
	BarChart2,
	Users,
	Settings,
	HelpCircle
} from "lucide-react"

export function Sidebar() {
	return (
		<div className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4 dark:border-gray-800">
			<div className="mb-8 px-4">
		</div>

			<nav className="space-y-1">
				<NavItem href="/skill-tree" icon={<Play className="h-5 w-5" />} text="Metro" />
				<NavItem href="/" icon={<Home className="h-5 w-5" />} text="Dashboard" />
				<NavItem href="/development" icon={<BarChart2 className="h-5 w-5" />} text="Development" />
				<NavItem href="/job-family" icon={<Layers className="h-5 w-5" />} text="Job Families" />
				<NavItem href="/career-path" icon={<Award className="h-5 w-5" />} text="Career Paths" />
				<NavItem href="/competences" icon={<Briefcase className="h-5 w-5" />} text="Competences" />
				{/* <NavItem href="/analytics" icon={<BarChart2 className="h-5 w-5" />} text="Analytics" /> */}
				<NavItem href="/team" icon={<Users className="h-5 w-5" />} text="Team" />
			</nav>

			<div className="mt-auto space-y-1">
				<NavItem href="/settings" icon={<Settings className="h-5 w-5" />} text="Settings" />
				<NavItem href="/help" icon={<HelpCircle className="h-5 w-5" />} text="Help & Support" />
			</div>
		</div>
	)
}

function NavItem({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) {
	return (
		<Link
			href={href}
			className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			{icon}
			<span>{text}</span>
		</Link>
	)
}
