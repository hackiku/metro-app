// ~/app/_components/layout/CollapsibleSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Play,
	Compass,
	Map,
	ChartColumnIncreasing,
	FolderTree,
	Handshake,
	MessageSquare,
	Factory,
	Home,
	Layers,
	Award,
	Briefcase,
	BarChart2,
	Users,
	Settings,
	HelpCircle,
	TrendingUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItemConfig {
	href: string;
	icon: LucideIcon;
	text: string;
}

interface NavGroupConfig {
	items: NavItemConfig[];
	showDivider?: boolean;
}

// Navigation configuration
const navigationConfig: NavGroupConfig[] = [
	{
		// User perspective navigation
		items: [
			{ href: "/", icon: Home, text: "Dashboard" },
			{ href: "/metro", icon: Play, text: "Metro" },
			{ href: "/destinations", icon: Compass, text: "Destinations" },
			{ href: "/route", icon: Map, text: "Route Plan" },
			{ href: "/comparison", icon: BarChart2, text: "Comparison" },
			{ href: "/growth", icon: TrendingUp, text: "Growth" },
			{ href: "/conversation", icon: MessageSquare, text: "Conversation" },
		],
		showDivider: true
	},
	{
		// HR planning & debug
		items: [
			{ href: "/hr", icon: BarChart2, text: "HR Admin" },
			{ href: "/job-family", icon: Layers, text: "Job Families" },
			{ href: "/competences", icon: Briefcase, text: "Competences" },
			{ href: "/company", icon: Factory, text: "Company" },
		],
		showDivider: true
	},
	{
		// Footer navigation
		items: [
			{ href: "/settings", icon: Settings, text: "Settings" },
			{ href: "/help", icon: HelpCircle, text: "Help & Support" }
		]
	}
];

interface CollapsibleSidebarProps {
	isCollapsed: boolean;
}

export function CollapsibleSidebar({ isCollapsed }: CollapsibleSidebarProps) {
	const pathname = usePathname();

	return (
		<div
			className={cn(
				"flex h-full flex-col px-2 py-4 transition-all duration-300",
				isCollapsed ? "items-center" : "px-3"
			)}
		>
			<div className={cn("mb-8", isCollapsed ? "h-6 w-6" : "px-2")}>
				{/* Logo can go here if needed */}
			</div>

			<TooltipProvider delayDuration={0}>
				<div className="flex flex-col h-full">
					{navigationConfig.map((group, groupIndex) => (
						<div key={groupIndex} className={groupIndex === navigationConfig.length - 1 ? "mt-auto" : ""}>
							<nav className="space-y-1">
								{group.items.map((item) => (
									<NavItem
										key={item.href}
										href={item.href}
										icon={<item.icon className="h-5 w-5" />}
										text={item.text}
										isCollapsed={isCollapsed}
										isActive={pathname === item.href}
									/>
								))}
							</nav>
							{group.showDivider && (
								<hr className={cn("my-3 border-t border-border", isCollapsed ? "w-6 mx-auto" : "")} />
							)}
						</div>
					))}
				</div>
			</TooltipProvider>
		</div>
	);
}

function NavItem({
	href,
	icon,
	text,
	isCollapsed,
	isActive
}: {
	href: string;
	icon: React.ReactNode;
	text: string;
	isCollapsed: boolean;
	isActive: boolean;
}) {
	if (isCollapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Link
						href={href}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-md transition-colors",
							isActive
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
						)}
					>
						{icon}
					</Link>
				</TooltipTrigger>
				<TooltipContent side="right">
					{text}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
				isActive
					? "bg-accent text-accent-foreground"
					: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
			)}
		>
			{icon}
			<span>{text}</span>
		</Link>
	);
}