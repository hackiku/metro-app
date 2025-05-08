// File 2: src/components/ui/mode-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"

export function ModeToggle() {
	const { theme, setTheme } = useTheme()
	const isDarkMode = theme === "dark"

	const toggleTheme = () => {
		setTheme(isDarkMode ? "light" : "dark")
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
			aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
		>
			{isDarkMode ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
		</Button>
	)
}