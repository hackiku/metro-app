"use client";

// src/app/algo-map/page.tsx
import React, { useState, useEffect } from "react";
import { Providers } from "~/contexts/Providers";
import AlgoMap from "~/app/_components/metro/map/AlgoMap";

export default function MetroAlgoPage() {
	const [isClient, setIsClient] = useState(false);

	// Ensure Metro is only rendered client-side to avoid hydration issues
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="relative h-full">
			{isClient && (
				<Providers>
					<div className="absolute inset-0">
						<AlgoMap debug={true} />
					</div>
				</Providers>
			)}
		</div>
	);
}