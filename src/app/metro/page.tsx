// src/app/metro/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MetroMapProvider } from "~/contexts/MetroMapContext";
// Only need the SessionProvider now
import { SessionProvider } from "~/contexts/SessionContext";
// Import the refactored CareerCompass component
import CareerCompass from "~/app/_components/metro/CareerCompass";

export default function MetroPage() {
	const [isClient, setIsClient] = useState(false);

	// Ensure components using hooks are only rendered client-side
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="relative h-full w-full">
			{isClient ? (
				<SessionProvider>
					<MetroMapProvider >
						<CareerCompass />
					</MetroMapProvider>
				</SessionProvider>
			) : (
				<div className="flex items-center justify-center h-full w-full">
					<div className="flex flex-col items-center">
						<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
						<p className="mt-4 text-muted-foreground">Loading Metro Map...</p>
					</div>
				</div>
			)}
		</div>
	);
}