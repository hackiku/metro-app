// src/app/json-data/page.tsx
"use client"

import { useState, useEffect } from "react"
import { supabase } from "~/server/db/supabase"
import { JsonDisplay } from "./JsonDisplay"
import { TableSelector } from "./TableSelector"
import { QueryControls } from "./QueryControls"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Button } from "~/components/ui/button"
import { Loader2 } from "lucide-react"

const GASUNIE_TABLES = [
	"business_units",
	"metro_lines",
	"metro_stations",
	"station_connections",
	"skills",
	"station_skills",
	"development_steps",
	"training_programs",
	"demo_users"
]

export default function JsonDataPage() {
	const [selectedTable, setSelectedTable] = useState<string>(GASUNIE_TABLES[0])
	const [tableData, setTableData] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [rowLimit, setRowLimit] = useState(50)
	const [queryType, setQueryType] = useState<"all" | "sample">("all")

	useEffect(() => {
		async function fetchTableData() {
			setIsLoading(true)
			setError(null)

			try {
				let query = supabase
					.from(selectedTable)
					.select('gasunie')
					// .schema('gasunie')
					.limit(rowLimit)

				if (queryType === "sample") {
					// For sample, we just take a few random rows
					query = query.order('id', { ascending: false }).limit(5)
				}

				const { data, error } = await query

				if (error) {
					console.error("Error fetching data:", error)
					setError(`Failed to fetch data: ${error.message}`)
					setTableData([])
				} else {
					setTableData(data || [])
				}
			} catch (err) {
				console.error("Unexpected error:", err)
				setError("An unexpected error occurred")
				setTableData([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchTableData()
	}, [selectedTable, rowLimit, queryType])

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Database Explorer</h1>
					<p className="text-muted-foreground">
						View and explore the Gasunie schema data
					</p>
				</div>

				<div className="flex items-center gap-2">
					<TableSelector
						tables={GASUNIE_TABLES}
						selectedTable={selectedTable}
						onSelectTable={setSelectedTable}
					/>
				</div>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>
						{selectedTable}
						{tableData.length > 0 && <span className="ml-2 text-sm text-muted-foreground">({tableData.length} rows)</span>}
					</CardTitle>
					<QueryControls
						rowLimit={rowLimit}
						setRowLimit={setRowLimit}
						queryType={queryType}
						setQueryType={setQueryType}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<span className="ml-2">Loading data...</span>
						</div>
					) : error ? (
						<div className="flex h-64 flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-6">
							<p className="text-center text-destructive">{error}</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => setSelectedTable(selectedTable)}
							>
								Retry
							</Button>
						</div>
					) : tableData.length === 0 ? (
						<div className="flex h-64 items-center justify-center rounded-lg border border-muted bg-muted/10 p-6">
							<p className="text-center text-muted-foreground">No data found for this table</p>
						</div>
					) : (
						<JsonDisplay data={tableData} tableName={selectedTable} />
					)}
				</CardContent>
			</Card>
		</div>
	)
}