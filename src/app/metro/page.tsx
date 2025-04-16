"use client";

import { useState, useEffect } from "react";
import { Providers } from "~/contexts/Providers";
import CareerCompass from "~/app/_components/metro/CareerCompass";

export default function MetroPage() {
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
						<CareerCompass />
					</div>
				</Providers>
			)}
		</div>
	);
}