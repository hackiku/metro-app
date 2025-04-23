// src/app/_components/dashboard/CareerPreview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Map, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CareerPreviewProps {
	currentPosition: string;
	nextPosition?: string;
	isLoading?: boolean;
}

export function CareerPreview({
	currentPosition,
	nextPosition = "Senior Position",
	isLoading = false
}: CareerPreviewProps) {

	if (isLoading) {
		return (
			<Card className="col-span-1 p-6">
				<CardHeader className="px-0 pt-0">
					<CardTitle className="text-xl font-semibold">Career Growth Path</CardTitle>
				</CardHeader>
				<CardContent className="px-0 pb-0">
					<div className="mt-4 flex h-64 items-center justify-center">
						<div className="flex flex-col items-center">
							<div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
							<div className="mt-4 h-6 w-40 animate-pulse rounded-md bg-muted" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="col-span-1 p-6">
			<CardHeader className="px-0 pt-0">
				<CardTitle className="text-xl font-semibold">Career Growth Path</CardTitle>
			</CardHeader>
			<CardContent className="px-0 pb-0">
				<p className="text-sm text-muted-foreground">
					Your projected career development path
				</p>

				<div className="my-8 flex flex-col items-center">
					<div className="flex items-center justify-center gap-3">
						{/* Current position */}
						<div className="flex flex-col items-center">
							<div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
								<span className="text-primary text-xl font-semibold">You</span>
								<div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
									3
								</div>
							</div>
							<p className="mt-2 text-center font-medium">{currentPosition}</p>
						</div>

						{/* Arrow */}
						<ArrowRight className="h-8 w-8 text-muted-foreground mx-3" />

						{/* Next position */}
						<div className="flex flex-col items-center">
							<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
								<span className="text-muted-foreground text-xl font-semibold">→</span>
							</div>
							<p className="mt-2 text-center text-muted-foreground">{nextPosition}</p>
						</div>
					</div>

					<Button className="mt-8" asChild>
						<Link href="/metro">
							<Map className="mr-2 h-4 w-4" />
							Explore Full Career Map
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}