// src/app/organization/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { OrgDataRow } from "./services/orgDataService";
import { fetchOrgData } from "./services/orgDataService";

// Import the new components
import { StrategyVisionCard } from "./components/StrategyVisionCard";
import { FinancialCard } from "./components/FinancialCard";
import { InvestmentProjectCard } from "./components/InvestmentProjectCard";
import { OperationsCard } from "./components/OperationsCard";
import { EsgCard } from "./components/EsgCard";
// Import Skeleton or loading indicator if you have one
// import { Skeleton } from "~/components/ui/skeleton";

const REPORT_YEAR = 2024;

export default function OrganizationDashboardPage() {
	const [orgData, setOrgData] = useState<OrgDataRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadData() {
			try {
				setIsLoading(true);
				setError(null);
				const data = await fetchOrgData(REPORT_YEAR);
				setOrgData(data);
			} catch (err: any) {
				console.error("Failed to load organization data:", err);
				setError(err.message || "An unexpected error occurred");
			} finally {
				setIsLoading(false);
			}
		}

		loadData();
	}, []);

	// Helper to find data for a specific area
	const getDataForArea = (areaName: string): OrgDataRow | null | undefined => {
		return orgData.find(row => row.area === areaName);
	};

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Gasunie Organization Overview ({REPORT_YEAR})</h1>
					<p className="text-muted-foreground">
						Strategic, Financial, Operational & ESG Highlights from the {REPORT_YEAR} Annual Report.
					</p>
				</div>
				{/* Add filters or controls here later if needed */}
			</div>

			{isLoading && (
				// Simple loading state using skeleton cards
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Create placeholders matching your card layout */}
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
						// Adjust height based on typical card height
					))}
				</div>
			)}

			{error && (
				<div className="text-destructive bg-destructive/10 p-4 rounded-md">
					<p>Failed to load data: {error}</p>
				</div>
			)}

			{!isLoading && !error && orgData.length === 0 && (
				<div className="text-center text-muted-foreground py-10">
					<p>No organization data found for {REPORT_YEAR}.</p>
				</div>
			)}

			{!isLoading && !error && orgData.length > 0 && (
				// Main dashboard grid
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Strategy & Vision Card */}
					<div className="lg:col-span-1">
						<StrategyVisionCard data={getDataForArea('Strategy')} />
					</div>

					{/* Financial Card */}
					<div className="lg:col-span-1">
						<FinancialCard data={getDataForArea('Financials')} />
					</div>

					{/* Investment & Projects Card */}
					<div className="lg:col-span-1">
						<InvestmentProjectCard data={getDataForArea('Investments')} />
					</div>

					{/* Operations Card */}
					<div className="lg:col-span-1 lg:col-start-1"> {/* Example layout adjustment */}
						<OperationsCard data={getDataForArea('Operations')} />
					</div>

					{/* ESG Card */}
					<div className="lg:col-span-1">
						<EsgCard data={getDataForArea('ESG')} />
					</div>

					{/* Add Governance/Risk Card if needed later */}

				</div>
			)}
		</div>
	);
}