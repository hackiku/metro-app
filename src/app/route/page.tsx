// src/app/metro/page.tsx
"use client";

import { useState, useEffect } from "react";
// Import the UPDATED Providers
import { Providers } from "~/contexts/Providers";
// Import the NEW CareerCompass component (adjust path if you place it elsewhere)
import CareerCompass from "~/app/_components/metro/CareerCompass";

export default function MetroPage() {
	const [isClient, setIsClient] = useState(false);

	// Ensure components using hooks are only rendered client-side
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="relative h-full w-full"> {/* Ensure full height/width */}
			{isClient ? (
				<Providers>
					{/* Wrap CareerCompass directly, let it handle layout */}
					<CareerCompass />
				</Providers>
			) : (
				// Optional: Add a server-side placeholder or loading state
				<div>Loading Map...</div>
			)}
		</div>
	);
}