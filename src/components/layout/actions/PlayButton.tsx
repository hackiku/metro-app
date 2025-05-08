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
			<Button
				variant="ghost"
				size="icon"
				className={cn(
					"rounded-full h-8 w-8 flex items-center justify-center",
					isPlaying ? "text-primary bg-primary/10" : "text-muted-foreground",
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
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={isPlaying ? "secondary" : "default"}
						size="sm"
						className={cn(
							"rounded-xl shadow-sm h-9 px-3.5 transition-all duration-300",
							isPlaying
								? "bg-primary/15 text-primary hover:bg-primary/20"
								: "bg-primary/90 text-primary-foreground hover:bg-primary/80",
							className
						)}
						onClick={toggleMetro}
					>
						<div className="flex items-center">
							{isPlaying ? (
								<>
									<Pause className="h-4 w-4 mr-2" />
									<span>Stop Metro</span>
								</>
							) : (
								<>
									<Play className="h-4 w-4 mr-2 ml-0.5" />
									<span>Start Metro</span>
								</>
							)}
						</div>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isPlaying ? "Return to previous view" : "Open Metro Map"}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}