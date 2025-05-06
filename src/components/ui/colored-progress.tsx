// src/components/ui/colored-progress.tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "~/lib/utils"

interface ColoredProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
	indicatorColorClassName?: string; // e.g., "bg-red-500", "bg-blue-500"
}

const ColoredProgress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	ColoredProgressProps
>(({ className, value, indicatorColorClassName = "bg-primary", ...props }, ref) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={cn(
			"relative h-2.5 w-full overflow-hidden rounded-full bg-primary/20 dark:bg-muted", // Adjusted background for better contrast
			className
		)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className={cn("h-full w-full flex-1 transition-all", indicatorColorClassName)}
			style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
		/>
	</ProgressPrimitive.Root>
))
ColoredProgress.displayName = ProgressPrimitive.Root.displayName

export { ColoredProgress }