// src/app/hr/summary/SummaryStats.tsx
"use client";

import { Card, CardContent } from "~/components/ui/card";
import {
	BarChart3,
	Briefcase,
	Users,
	TrendingUp
} from "lucide-react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";

export default function SummaryStats() {
	const { currentOrgId } = useSession();

	// Fetch data via tRPC
	const pathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Placeholder values for stats we don't have API endpoints for yet
	const employeeCount = 54;
	const growthRate = "12%";

	// Determine if any queries are loading
	const isLoading = pathsQuery.isLoading || positionsQuery.isLoading;

	return (
		<Card className="flex-1">
			<CardContent className="pt-6">
				<div className="grid grid-cols-2 gap-4">
					<StatItem
						icon={<BarChart3 className="h-4 w-4" />}
						label="Career Paths"
						value={isLoading ? "..." : pathsQuery.data?.length ?? 0}
					/>

					<StatItem
						icon={<Briefcase className="h-4 w-4" />}
						label="Positions"
						value={isLoading ? "..." : positionsQuery.data?.length ?? 0}
					/>

					<StatItem
						icon={<Users className="h-4 w-4" />}
						label="Employees"
						value={employeeCount}
					/>

					<StatItem
						icon={<TrendingUp className="h-4 w-4" />}
						label="Growth"
						value={growthRate}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function StatItem({
	icon,
	label,
	value
}: {
	icon: React.ReactNode;
	label: string;
	value: number | string;
}) {
	return (
		<div className="flex items-center gap-3">
			<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
				{icon}
			</div>
			<div>
				<p className="text-sm font-medium">{label}</p>
				<p className="text-xl font-bold">{value}</p>
			</div>
		</div>
	);
}