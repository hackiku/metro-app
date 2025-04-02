// ~/app/_components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Search, Bell, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function Navbar() {
	return (
		<nav className="flex h-16 items-center justify-between border-b border-border px-6">
			<div className="flex items-center gap-2">
				<Link href="/" className="text-lg font-semibold text-primary">
					Metro Map
				</Link>
			</div>

			<div className="flex items-center space-x-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search..."
						className="h-9 w-64 pl-10"
					/>
				</div>

				<Button variant="ghost" size="icon" className="text-muted-foreground">
					<Bell className="h-5 w-5" />
				</Button>

				<ModeToggle />

				<Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
					<User className="h-5 w-5" />
				</Button>
			</div>
		</nav>
	);
}