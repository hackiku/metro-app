// ~/app/_components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Search, Bell, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function Navbar() {
	return (
		<nav className="flex h-16 items-center justify-between border-b border-border px-6">
			<div className="flexitems-center gap-2">
				<Link href="/" className="flex flex-col items-end ">
					
					<h1 className="text-lg font-semibold">Career Compass</h1>
					
					{/* <Image 
						src="/assets/logos/gasunie-logo.svg"
						alt="Gasunie logo"
						height={26} width={100}
					/> */}
					<span className="text-foreground/60 font-thin text-[10px] ml-6 -mt-1">Metro Map</span>
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

				<Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
					<a href="https://preview--career-compass-thierry.lovable.app/" target="_blank">
						<Bell className="h-5 w-5" />					
					</a>
				</Button>

				<ModeToggle />

				<Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
					<User className="h-5 w-5" />
				</Button>
			</div>
		</nav>
	);
}