// src/app/hr/summary/ManagerCard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function ManagerCard() {
	return (
		<Card className="flex-1">
			<CardContent className="pt-6">
				<div className="flex items-start gap-4">
					<Avatar className="h-14 w-14 border">
						<AvatarImage src="/avatar-placeholder.jpg" alt="Manager" />
						<AvatarFallback>HR</AvatarFallback>
					</Avatar>

					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h3 className="font-medium text-lg">Alex Rodriguez</h3>
							<Badge variant="outline" className="text-xs">Admin</Badge>
						</div>

						<p className="text-sm text-muted-foreground">HR Director</p>

						<div className="flex gap-3 text-xs text-muted-foreground mt-2">
							<div>
								<span className="font-medium">12</span> Paths
							</div>
							<div>
								<span className="font-medium">38</span> Positions
							</div>
							<div>
								<span className="font-medium">54</span> Employees
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}