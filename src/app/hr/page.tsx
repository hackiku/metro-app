// src/app/hr/page.tsx
"use client";

import { useState, useEffect } from "react";
import { HrDashboard } from "./components/HrDashboard";
import { SessionProvider } from "~/contexts/SessionContext";

export default function HrPage() {
	const [isClient, setIsClient] = useState(false);

	// Ensure components using hooks are only rendered client-side
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="space-y-6 p-6">
			{isClient ? (
				// Wrap the HrDashboard with SessionProvider to provide the session context
				<SessionProvider>
					<HrDashboard />
				</SessionProvider>
			) : (
				<div className="animate-pulse">
					<div className="h-8 w-64 bg-muted rounded mb-2"></div>
					<div className="h-4 w-48 bg-muted rounded mb-8"></div>
					<div className="grid gap-4 grid-cols-1">
						<div className="h-64 bg-muted rounded"></div>
						<div className="h-48 bg-muted rounded"></div>
					</div>
				</div>
			)}
		</div>
	);
}