// src/app/hr/summary/MapPreview.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Maximize2, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function MapPreview() {
	const [loading, setLoading] = useState(true);

	// Simulate loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1500);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between p-4 border-b">
				<h3 className="font-medium">Metro Map Preview</h3>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" onClick={() => setLoading(true)}>
						<RefreshCw className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" asChild>
						<Link href="/metro">
							<Maximize2 className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>

			<div className="relative flex-1 bg-black/5 dark:bg-white/5">
				{loading ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
					</div>
				) : (
					<div className="h-full p-4">
						{/* This would be replaced with the actual map component */}
						<div className="relative h-full w-full rounded-md bg-black/10 dark:bg-white/10 overflow-hidden">
							{/* Simulate a simplified metro map */}
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
								<div className="relative">
									{/* Blue line */}
									<div className="absolute h-1 w-40 bg-blue-500 -rotate-45 -translate-x-1/2"></div>
									{/* Red line */}
									<div className="absolute h-1 w-40 bg-red-500 rotate-45 -translate-x-1/2"></div>
									{/* Green line */}
									<div className="absolute h-1 w-40 bg-green-500 rotate-[135deg] -translate-x-1/2"></div>

									{/* Stations */}
									<div className="absolute h-3 w-3 rounded-full bg-blue-500 -left-14 -top-14"></div>
									<div className="absolute h-3 w-3 rounded-full bg-blue-500 -left-8 -top-8"></div>
									<div className="absolute h-3 w-3 rounded-full bg-blue-500 left-0 top-0"></div>

									<div className="absolute h-3 w-3 rounded-full bg-red-500 -left-14 top-14"></div>
									<div className="absolute h-3 w-3 rounded-full bg-red-500 -left-8 top-8"></div>
									<div className="absolute h-3 w-3 rounded-full bg-green-500 left-14 top-14"></div>
									<div className="absolute h-3 w-3 rounded-full bg-green-500 left-8 top-8"></div>

									{/* Central hub */}
									<div className="absolute h-5 w-5 rounded-full bg-purple-500 left-0 top-0"></div>
								</div>
							</div>

							<div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
								Preview Mode
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}