// src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	ChevronLeft,
	ChevronRight,
	Compass,
	Map,
	MessageSquare,
	Factory,
	Home,
	Layers,
	Briefcase,
	BarChart2,
	Settings,
	TrendingUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

// Navigation configuration - exporting so it can be reused by MobileSidebar
export const navigationConfig = [
	{
		// User perspective navigation
		items: [
			{ href: "/", icon: Home, text: "Dashboard" },
			{ href: "/destinations", icon: Compass, text: "Destinations" },
			{ href: "/route", icon: Map, text: "Route Plan" },
			{ href: "/comparison", icon: BarChart2, text: "Comparison" },
			{ href: "/growth", icon: TrendingUp, text: "Growth" },
			{ href: "/conversation", icon: MessageSquare, text: "Conversation" },
		]
	},
	{
		// HR planning & management
		title: "admin",
		items: [
			{ href: "/hr", icon: BarChart2, text: "HR Admin" },
			{ href: "/job-family", icon: Layers, text: "Job Families" },
			{ href: "/competences", icon: Briefcase, text: "Competences" },
			{ href: "/company", icon: Factory, text: "Company" },
		],
		collapsible: true
	},
	{
		// Footer navigation
		items: [
			{ href: "/settings", icon: Settings, text: "Settings" },
		]
	}
];

interface SidebarProps {
	isCollapsed?: boolean;
	onToggleCollapse?: (collapsed: boolean) => void;
	className?: string;
}

export function Sidebar({ isCollapsed: propIsCollapsed, onToggleCollapse, className }: SidebarProps) {
	const pathname = usePathname();
	const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
	// Start with admin menu closed by default
	const [managerMenuOpen, setManagerMenuOpen] = useState(false);

	// Use either the prop or internal state
	const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalIsCollapsed;

	// Toggle collapse state
	const toggleCollapse = () => {
		const newState = !isCollapsed;
		if (onToggleCollapse) {
			onToggleCollapse(newState);
		} else {
			setInternalIsCollapsed(newState);
		}
	};

	return (
		<div className={cn(
			"flex flex-col h-full  relative transition-all duration-300 rounded-tl-3xl",
			isCollapsed ? "w-15" : "w-56",
			className
		)}>
			<div className={cn(
				"flex flex-col h-full py-6 overflow-hidden",
				isCollapsed ? "items-center px-2" : "px-4"
			)}>
				{/* Top margin space */}
				<div className="mb-6"></div>

				<TooltipProvider delayDuration={0}>
					<div className="flex flex-col h-full">
						{/* First navigation group (always visible) */}
						<div className="mb-6">
							<nav className="space-y-1">
								{navigationConfig[0].items.map((item) => (
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
						</div>

						{/* Admin section with toggle */}
						<div className="mb-6">
							{/* Group title and toggle */}
							{!isCollapsed ? (
								<Collapsible
									open={managerMenuOpen}
									onOpenChange={setManagerMenuOpen}
									className="w-full"
								>
									<CollapsibleTrigger className="flex items-center w-full py-2 px-2 text-xs font-normal text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/60 rounded-lg uppercase tracking-wider">
										<span>admin</span>
										<ChevronRight className={cn(
											"ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
											managerMenuOpen && "rotate-90"
										)} />
									</CollapsibleTrigger>
									<CollapsibleContent className="space-y-1 pt-1 transition-all">
										{navigationConfig[1].items.map((item) => (
											<NavItem
												key={item.href}
												href={item.href}
												icon={<item.icon className="h-5 w-5" />}
												text={item.text}
												isCollapsed={isCollapsed}
												isActive={pathname === item.href}
											/>
										))}
									</CollapsibleContent>
								</Collapsible>
							) : (
								<>
									{/* Admin toggle button when collapsed */}
									<Collapsible
										open={managerMenuOpen}
										onOpenChange={setManagerMenuOpen}
									>
										<Tooltip>
											<TooltipTrigger asChild>
												<CollapsibleTrigger asChild>
													<div
														className="h-4 w-full rounded-full -mt-2 mb-2 flex items-center justify-center text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/40 cursor-pointer"
													>
														<ChevronRight className={cn(
															"h-4 w-4 transition-transform duration-200",
															managerMenuOpen && "rotate-90"
														)} />
														<span className="sr-only">Toggle admin menu</span>
													</div>
												</CollapsibleTrigger>
											</TooltipTrigger>
											<TooltipContent side="right">Admin menu</TooltipContent>
										</Tooltip>
										<CollapsibleContent className="space-y-1">
											{navigationConfig[1].items.map((item) => (
												<NavItem
													key={item.href}
													href={item.href}
													icon={<item.icon className="h-5 w-5" />}
													text={item.text}
													isCollapsed={isCollapsed}
													isActive={pathname === item.href}
												/>
											))}
										</CollapsibleContent>
									</Collapsible>
								</>
							)}
						</div>

						{/* Footer navigation (settings) */}
						<div className="mt-auto mb-12">
							<nav className="space-y-1">
								{navigationConfig[2].items.map((item) => (
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
						</div>
					</div>
				</TooltipProvider>
			</div>

			{/* Toggle button positioned at the right edge, fixed position */}
			<div className="absolute right-0 translate-x-1/2 bottom-20 z-10">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full bg-background hover:bg-background/90 text-muted-foreground/50 hover:text-muted-foreground transition-all"
					onClick={toggleCollapse}
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
					<span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} sidebar</span>
				</Button>
			</div>
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
							"flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
							isActive
								? "bg-primary/15 text-primary"
								: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
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
				"flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
				isActive
					? "bg-primary/15 text-primary"
					: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
			)}
		>
			{icon}
			<span>{text}</span>
		</Link>
	);
}