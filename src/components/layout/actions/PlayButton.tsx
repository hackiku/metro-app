// src/components/layout/actions/PlayButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Play, Pause } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

interface PlayButtonProps {
	className?: string;
	variant?: "default" | "mini";
}

export function PlayButton({ className, variant = "default" }: PlayButtonProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isPlaying, setIsPlaying] = useState(false);

	// Check if we're on the metro page
	useEffect(() => {
		setIsPlaying(pathname === "/metro");
	}, [pathname]);

	// Toggle between metro and previous page
	const toggleMetro = () => {
		if (isPlaying) {
			// If we're on metro, go to home or the stored previous page
			const previousPage = localStorage.getItem("previousPageBeforeMetro") || "/";
			router.push(previousPage);
		} else {
			// Store current page before navigating to metro
			if (pathname !== "/metro") {
				localStorage.setItem("previousPageBeforeMetro", pathname);
			}
			router.push("/metro");
		}
	};

	if (variant === "mini") {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"rounded-full h-9 w-9 text-muted-foreground hover:text-foreground",
								isPlaying && "text-primary hover:text-primary/90",
								className
							)}
							onClick={toggleMetro}
						>
							{isPlaying ? (
								<Pause className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4 ml-0.5" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						{isPlaying ? "Close Metro" : "Open Metro"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={isPlaying ? "outline" : "ghost"}
						size="sm"
						className={cn(
							"rounded-md h-9 transition-all flex items-center gap-2",
							isPlaying
								? "text-primary border-primary/50 hover:border-primary"
								: "text-muted-foreground hover:text-foreground",
							className
						)}
						onClick={toggleMetro}
					>
						{isPlaying ? (
							<>
								<Pause className="h-4 w-4" />
								<span className="text-sm">Metro</span>
							</>
						) : (
							<>
								<Play className="h-4 w-4" />
								<span className="text-sm">Metro</span>
							</>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isPlaying ? "Return to previous view" : "Open Metro Map"}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}