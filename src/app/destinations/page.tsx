// src/app/route/destinations.tsx
"use client";

import { useEffect } from "react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useUser } from "~/contexts/UserContext";
import { api } from "~/trpc/react";

export default function DestinationsPage() {
	// Get data from contexts
	const { currentOrganization, organizations, loading: orgLoading } = useOrganization();
	const { currentUser, users, loading: userLoading } = useUser();

	// Get utils for invalidating queries
	const utils = api.useUtils();

	// Use the current organization ID to fetch career paths
	const currentOrgId = currentOrganization?.id;
	const { data: careerPaths, isLoading: pathsLoading } = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{
			enabled: !!currentOrgId,
			// Add a key that depends on the organization ID to ensure refetching
			queryKey: ['careerPaths', currentOrgId]
		}
	);

	// This effect will run whenever the organization changes
	useEffect(() => {
		if (currentOrgId) {
			// Invalidate the career paths query to force a refetch
			utils.career.getPaths.invalidate({ organizationId: currentOrgId });
		}
	}, [currentOrgId, utils.career.getPaths]);

	// Loading state
	if (orgLoading || userLoading || pathsLoading) {
		return (
			<div className="p-8">
				<div className="animate-pulse space-y-4">
					<div className="h-10 w-64 bg-muted rounded"></div>
					<div className="h-40 bg-muted rounded"></div>
					<div className="h-40 bg-muted rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">Context Data Test</h1>
				<p className="text-muted-foreground mb-8">
					This page shows the data available in the contexts
				</p>
			</div>

			{/* Organization Data */}
			<div className="border rounded-lg p-4">
				<h2 className="text-xl font-semibold mb-2">Current Organization</h2>
				{currentOrganization ? (
					<div className="space-y-2">
						<p><strong>Name:</strong> {currentOrganization.name}</p>
						<p><strong>ID:</strong> {currentOrganization.id}</p>
						<p><strong>Description:</strong> {currentOrganization.description || "N/A"}</p>
						{currentOrganization.primary_color && (
							<div className="flex items-center gap-2">
								<span>Primary Color:</span>
								<div
									className="h-4 w-4 rounded-full border"
									style={{ backgroundColor: currentOrganization.primary_color }}
								></div>
								<span>{currentOrganization.primary_color}</span>
							</div>
						)}
					</div>
				) : (
					<p className="text-muted-foreground">No organization selected</p>
				)}
			</div>

			{/* User Data */}
			<div className="border rounded-lg p-4">
				<h2 className="text-xl font-semibold mb-2">Current User</h2>
				{currentUser ? (
					<div className="space-y-2">
						<p><strong>Name:</strong> {currentUser.full_name}</p>
						<p><strong>Email:</strong> {currentUser.email}</p>
						<p><strong>Role:</strong> {currentUser.role}</p>
						<p><strong>Level:</strong> {currentUser.level}</p>
						<p><strong>Years in Role:</strong> {currentUser.years_in_role}</p>
					</div>
				) : (
					<p className="text-muted-foreground">No user selected</p>
				)}
			</div>

			{/* Career Paths Table */}
			<div className="border rounded-lg p-4">
				<h2 className="text-xl font-semibold mb-4">Career Paths for Current Organization</h2>
				{careerPaths && careerPaths.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-muted">
									<th className="border p-2 text-left">Name</th>
									<th className="border p-2 text-left">Description</th>
									<th className="border p-2 text-left">Color</th>
								</tr>
							</thead>
							<tbody>
								{careerPaths.map((path) => (
									<tr key={path.id} className="hover:bg-muted/50">
										<td className="border p-2">{path.name}</td>
										<td className="border p-2">{path.description || "N/A"}</td>
										<td className="border p-2">
											<div className="flex items-center gap-2">
												<div
													className="h-4 w-4 rounded-full border"
													style={{ backgroundColor: path.color || "#ccc" }}
												></div>
												<span>{path.color || "N/A"}</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-muted-foreground">No career paths found for this organization</p>
				)}
			</div>

			{/* All Organizations Table */}
			<div className="border rounded-lg p-4">
				<h2 className="text-xl font-semibold mb-4">All Available Organizations</h2>
				{organizations && organizations.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-muted">
									<th className="border p-2 text-left">Name</th>
									<th className="border p-2 text-left">ID</th>
									<th className="border p-2 text-left">Description</th>
								</tr>
							</thead>
							<tbody>
								{organizations.map((org) => (
									<tr key={org.id} className={org.id === currentOrganization?.id ? "bg-primary/10" : "hover:bg-muted/50"}>
										<td className="border p-2">{org.name}</td>
										<td className="border p-2 font-mono text-xs">{org.id}</td>
										<td className="border p-2">{org.description || "N/A"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-muted-foreground">No organizations available</p>
				)}
			</div>

			{/* All Users Table */}
			<div className="border rounded-lg p-4">
				<h2 className="text-xl font-semibold mb-4">All Available Users</h2>
				{users && users.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-muted">
									<th className="border p-2 text-left">Name</th>
									<th className="border p-2 text-left">Email</th>
									<th className="border p-2 text-left">Role</th>
									<th className="border p-2 text-left">Level</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr key={user.id} className={user.id === currentUser?.id ? "bg-primary/10" : "hover:bg-muted/50"}>
										<td className="border p-2">{user.full_name}</td>
										<td className="border p-2">{user.email}</td>
										<td className="border p-2">{user.role}</td>
										<td className="border p-2">{user.level}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-muted-foreground">No users available</p>
				)}
			</div>
		</div>
	);
}