// src/app/skill-tree/page.tsx

"use client";

import { useState } from "react";
import { Metro } from "~/app/_components/metro/Metro";
import { GameTabs } from "./GameTabs";

export default function SkillTreePage() {
	const [activeTab, setActiveTab] = useState("technical");

	return (
		<div className="relative h-full">
			{/* Main Metro Component */}
			<div className="absolute inset-0">
				<Metro activeTab={activeTab} />
			</div>

			{/* Bottom centered tabs */}
			<div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center">
				<GameTabs activeTab={activeTab} onTabChange={setActiveTab} />
			</div>
		</div>
	);
}