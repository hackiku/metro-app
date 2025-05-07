// src/components/layout/actions/UserOrganizationManager.tsx
"use client"

import { useState, useEffect } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { toast } from "sonner"
import { api } from "~/trpc/react"
import { User, Building, Check } from "lucide-react"

interface UserOrganizationManagerProps {
	userId: string
	trigger: React.ReactNode
}

export function UserOrganizationManager({ userId, trigger }: UserOrganizationManagerProps) {
	const [open, setOpen] = useState(false)
	const [userOrgs, setUserOrgs] = useState<Array<{ id: string, name: string, is_member: boolean, is_primary: boolean }>>([])
	const [loading, setLoading] = useState(true)

	// Fetch all available organizations
	const { data: organizations } = api.organization.getAll.useQuery()

	// Fetch the user's current organizations
	const { data: userOrganizations } = api.user.getUserOrganizations.useQuery(
		{ userId },
		{ enabled: !!userId && open }
	)

	// Mutations
	const utils = api.useUtils()

	const addToOrgMutation = api.user.addToOrganization.useMutation({
		onSuccess: () => {
			toast.success("Organization membership updated")
			utils.user.getUserOrganizations.invalidate({ userId })
		},
		onError: (error) => {
			toast.error(`Failed to update organization membership: ${error.message}`)
		}
	})

	const removeFromOrgMutation = api.user.removeFromOrganization.useMutation({
		onSuccess: () => {
			toast.success("User removed from organization")
			utils.user.getUserOrganizations.invalidate({ userId })
		},
		onError: (error) => {
			toast.error(`Failed to remove from organization: ${error.message}`)
		}
	})

	const setPrimaryOrgMutation = api.user.setPrimaryOrganization.useMutation({
		onSuccess: () => {
			toast.success("Primary organization updated")
			utils.user.getUserOrganizations.invalidate({ userId })
		},
		onError: (error) => {
			toast.error(`Failed to update primary organization: ${error.message}`)
		}
	})

	// Merge organizations and user organizations data
	useEffect(() => {
		if (organizations && userOrganizations) {
			setLoading(false)

			// Create a map of org IDs to membership status
			const userOrgMap = new Map(
				userOrganizations.map(uo => [uo.organization_id, {
					is_member: true,
					is_primary: uo.is_primary
				}])
			)

			// Merge with all organizations
			const mergedOrgs = organizations.map(org => ({
				id: org.id,
				name: org.name,
				is_member: userOrgMap.has(org.id),
				is_primary: userOrgMap.get(org.id)?.is_primary || false
			}))

			setUserOrgs(mergedOrgs)
		}
	}, [organizations, userOrganizations])

	const handleToggleOrg = (orgId: string, isMember: boolean) => {
		if (isMember) {
			// Remove from organization
			removeFromOrgMutation.mutate({
				userId,
				organizationId: orgId
			})
		} else {
			// Add to organization
			addToOrgMutation.mutate({
				userId,
				organizationId: orgId,
				isPrimary: false
			})
		}
	}

	const handleSetPrimary = (orgId: string) => {
		setPrimaryOrgMutation.mutate({
			userId,
			organizationId: orgId
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Organization Membership</DialogTitle>
					<DialogDescription>
						Manage which organizations this user belongs to and set their primary organization.
					</DialogDescription>
				</DialogHeader>

				{loading ? (
					<div className="py-6 text-center">
						<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
						<p className="text-sm text-muted-foreground mt-2">Loading organizations...</p>
					</div>
				) : (
					<ScrollArea className="max-h-[60vh]">
						<div className="space-y-4 py-4 pr-2">
							{userOrgs.map(org => (
								<div key={org.id} className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Checkbox
											id={`org-${org.id}`}
											checked={org.is_member}
											onCheckedChange={() => handleToggleOrg(org.id, org.is_member)}
										/>
										<div className="flex items-center gap-2">
											<div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
												<Building className="h-3 w-3 text-primary" />
											</div>
											<label
												htmlFor={`org-${org.id}`}
												className="text-sm font-medium cursor-pointer"
											>
												{org.name}
											</label>
										</div>
									</div>

									{org.is_member && (
										<div className="flex items-center space-x-2">
											{org.is_primary ? (
												<Badge variant="outline" className="text-primary border-primary">
													Primary
												</Badge>
											) : (
												<Button
													variant="ghost"
													size="sm"
													className="h-8 px-2"
													onClick={() => handleSetPrimary(org.id)}
												>
													<Check className="h-3.5 w-3.5 mr-1" />
													Make Primary
												</Button>
											)}
										</div>
									)}
								</div>
							))}

							{userOrgs.length === 0 && (
								<p className="text-center text-sm text-muted-foreground py-4">
									No organizations available
								</p>
							)}
						</div>
					</ScrollArea>
				)}

				<DialogFooter>
					<Button onClick={() => setOpen(false)}>
						Done
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}