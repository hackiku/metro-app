// src/components/dev/EditorTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface EditorTabsProps {
	activeTab: string;
	onTabChange: (value: string) => void;
	cardView: React.ReactNode;
	jsonView: React.ReactNode;
}

export function EditorTabs({
	activeTab,
	onTabChange,
	cardView,
	jsonView
}: EditorTabsProps) {
	return (
		<Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
			<div className="flex justify-end mb-2">
				<TabsList>
					<TabsTrigger value="card">Card View</TabsTrigger>
					<TabsTrigger value="json">JSON View</TabsTrigger>
				</TabsList>
			</div>

			<div className="border rounded-md p-1 h-[60vh] overflow-auto">
				<TabsContent value="card" className="h-full m-0 p-2 data-[state=active]:block">
					{cardView}
				</TabsContent>

				<TabsContent value="json" className="h-full m-0 p-2 data-[state=active]:block">
					{jsonView}
				</TabsContent>
			</div>
		</Tabs>
	);
}
