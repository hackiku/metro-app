// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "~/app/_components/dashboard/Dashboard";

export default function Home() {
	const [isClient, setIsClient] = useState(false);

	// Ensure components using hooks are only rendered client-side
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="space-y-6 p-6">
			{isClient ? (
				<Dashboard />
			) : (
				<div className="animate-pulse">
					<div className="h-8 w-64 bg-muted rounded mb-2"></div>
					<div className="h-4 w-48 bg-muted rounded mb-8"></div>
					<div className="grid gap-4 grid-cols-3">
						{[1, 2, 3].map(i => (
							<div key={i} className="h-32 bg-muted rounded"></div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}