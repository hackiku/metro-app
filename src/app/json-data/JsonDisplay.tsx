// src/app/json-data/JsonDisplay.tsx
"use client"

import { useState } from "react"
import { Check, Clipboard, ClipboardCheck } from "lucide-react"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

interface JsonDisplayProps {
	data: any[]
	tableName: string
}

export function JsonDisplay({ data, tableName }: JsonDisplayProps) {
	const [copied, setCopied] = useState(false)
	const [viewMode, setViewMode] = useState<"pretty" | "compact" | "table">("pretty")

	// Format JSON based on the selected view mode
	const getFormattedJson = () => {
		if (viewMode === "pretty") {
			return JSON.stringify(data, null, 2)
		} else {
			return JSON.stringify(data)
		}
	}

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(getFormattedJson())
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error("Failed to copy:", err)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between">
				<Tabs
					value={viewMode}
					onValueChange={(value) => setViewMode(value as "pretty" | "compact" | "table")}
					className="w-full"
				>
					<TabsList>
						<TabsTrigger value="pretty">Pretty JSON</TabsTrigger>
						<TabsTrigger value="compact">Compact JSON</TabsTrigger>
						<TabsTrigger value="table">Table View</TabsTrigger>
					</TabsList>

					<Button
						variant="outline"
						size="sm"
						className="ml-auto"
						onClick={copyToClipboard}
					>
						{copied ? (
							<>
								<ClipboardCheck className="mr-2 h-4 w-4 text-green-500" />
								Copied!
							</>
						) : (
							<>
								<Clipboard className="mr-2 h-4 w-4" />
								Copy JSON
							</>
						)}
					</Button>
				</Tabs>
			</div>

			<TabsContent value="pretty" className="mt-0">
				<ScrollArea className="h-[500px] rounded-md border bg-muted/20 p-4 dark:bg-slate-950">
					<pre className="text-sm">
						<code>{JSON.stringify(data, null, 2)}</code>
					</pre>
				</ScrollArea>
			</TabsContent>

			<TabsContent value="compact" className="mt-0">
				<ScrollArea className="h-[500px] rounded-md border bg-muted/20 p-4 dark:bg-slate-950">
					<pre className="text-sm">
						<code>{JSON.stringify(data)}</code>
					</pre>
				</ScrollArea>
			</TabsContent>

			<TabsContent value="table" className="mt-0">
				<ScrollArea className="h-[500px]">
					{data.length > 0 ? (
						<div className="rounded-md border">
							<table className="w-full">
								<thead>
									<tr className="border-b bg-muted/50">
										{Object.keys(data[0]).map((key) => (
											<th key={key} className="p-2 text-left text-xs font-medium uppercase">
												{key}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{data.map((row, i) => (
										<tr key={i} className="border-b last:border-0 hover:bg-muted/20">
											{Object.values(row).map((value: any, j) => (
												<td key={j} className="p-2 text-sm">
													{typeof value === 'object'
														? JSON.stringify(value)
														: String(value)}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex h-32 items-center justify-center">
							<p className="text-muted-foreground">No data available</p>
						</div>
					)}
				</ScrollArea>
			</TabsContent>
		</div>
	)
}