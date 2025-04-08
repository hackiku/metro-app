// src/app/hr/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { HrDataRow } from "./services/hrDataService";
import { fetchHrData } from "./services/hrDataService";
import { HrDataCard } from "./components/HrDataCard"; // Import the card component

const REPORT_YEAR = 2024; // Define the year we want data for

export default function HrDashboardPage() {
	const [hrData, setHrData] = useState<HrDataRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadData() {
			try {
				setIsLoading(true);
				setError(null);
				const data = await fetchHrData(REPORT_YEAR);
				setHrData(data);
			} catch (err: any) {
				console.error("Failed to load HR data:", err);
				setError(err.message || "An unexpected error occurred");
			} finally {
				setIsLoading(false);
			}
		}

		loadData();
	}, []); // Empty dependency array to run only once on mount

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Gasunie HR Overview ({REPORT_YEAR})</h1>
					<p className="text-muted-foreground">
						Key insights and metrics from the {REPORT_YEAR} Annual Report HR sections.
					</p>
				</div>
				{/* Add filters or controls here later if needed */}
			</div>

			{isLoading && (
				// Simple loading state using skeleton cards
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="h-60 animate-pulse rounded-lg bg-muted"
						/>
					))}
				</div>
			)}

			{error && (
				<div className="text-destructive bg-destructive/10 p-4 rounded-md">
					<p>Failed to load data: {error}</p>
				</div>
			)}

			{!isLoading && !error && hrData.length === 0 && (
				<div className="text-center text-muted-foreground py-10">
					<p>No HR data found for {REPORT_YEAR}.</p>
				</div>
			)}

			{!isLoading && !error && hrData.length > 0 && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{hrData.map((row) => (
						<HrDataCard key={row.id} dataRow={row} />
					))}
				</div>
			)}
		</div>
	);
}