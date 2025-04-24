// src/components/ui/color-preview.tsx
import React from "react";
import { cn } from "~/lib/utils";

interface ColorPreviewProps {
	color: string;
	size?: "sm" | "md" | "lg";
	className?: string;
	bordered?: boolean;
}

export function ColorPreview({
	color,
	size = "md",
	className,
	bordered = true
}: ColorPreviewProps) {
	// Size mappings
	const sizeMap = {
		sm: "w-3 h-3",
		md: "w-5 h-5",
		lg: "w-8 h-8"
	};

	return (
		<div
			className={cn(
				"rounded-full",
				sizeMap[size],
				bordered && "border border-border dark:border-muted",
				className
			)}
			style={{ backgroundColor: color || "#cccccc" }}
		/>
	);
}