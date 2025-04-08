// src/app/metro/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

// Simple data structure for our metro map
const initialData = {
	stations: {
		"station1": { name: "Pipeline Engineer", label: "Pipeline Engineer", level: 2 },
		"station2": { name: "Asset Manager", label: "Asset Manager", level: 3 },
		"station3": { name: "Operations Manager", label: "Operations Manager", level: 5 },
		"station4": { name: "Hydrogen Specialist", label: "Hydrogen Specialist", level: 2 },
		"station5": { name: "CCS Project Lead", label: "CCS Project Lead", level: 3 },
		"station6": { name: "Project Manager", label: "Project Manager", level: 4 },
	},
	lines: [
		{
			name: "Infrastructure Line",
			color: "#003366",
			nodes: [
				{ coords: [100, 100], name: "station1" },
				{ coords: [200, 100], name: "station2" },
				{ coords: [300, 100], name: "station3" },
			]
		},
		{
			name: "Energy Transition",
			color: "#FF671F",
			nodes: [
				{ coords: [100, 200], name: "station4" },
				{ coords: [200, 200], name: "station5" },
				{ coords: [300, 200], name: "station6" },
			]
		},
		{
			name: "Cross Path",
			color: "#888888",
			nodes: [
				{ coords: [200, 100], name: "station2" },
				{ coords: [200, 150], }, // Connection point
				{ coords: [200, 200], name: "station5" },
			]
		}
	]
};

export default function MetroPage() {
	const svgRef = useRef<SVGSVGElement>(null);
	const [selectedStation, setSelectedStation] = useState<string | null>(null);

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);

		// Clear previous elements
		svg.selectAll("*").remove();

		// Add a class to the SVG for text colors
		svg.attr("class", "text-foreground");

		// Draw each line
		initialData.lines.forEach(line => {
			// Create a line generator
			const lineGenerator = d3.line()
				.x(d => d[0])
				.y(d => d[1])
				.curve(d3.curveMonotoneX); // Smooth curve

			// Extract coordinates
			const lineCoords = line.nodes.map(node => node.coords);

			// Draw the path
			svg.append("path")
				.attr("d", lineGenerator(lineCoords as [number, number][]))
				.attr("stroke", line.color)
				.attr("stroke-width", 6)
				.attr("fill", "none")
				.attr("stroke-linecap", "round");
		});

		// Draw stations
		initialData.lines.forEach(line => {
			line.nodes.forEach(node => {
				if (node.name) {
					const station = initialData.stations[node.name];

					// Create station circle
					svg.append("circle")
						.attr("cx", node.coords[0])
						.attr("cy", node.coords[1])
						.attr("r", 10)
						.attr("fill", "var(--card)")
						.attr("stroke", line.color)
						.attr("stroke-width", 3)
						.attr("class", "station")
						.attr("data-station", node.name)
						.style("cursor", "pointer")
						.on("click", () => {
							setSelectedStation(node.name || null);
						});

					// Add station label
					svg.append("text")
						.attr("x", node.coords[0])
						.attr("y", node.coords[1] - 20)
						.attr("text-anchor", "middle")
						.attr("font-size", "12px")
						.attr("class", "fill-foreground")
						.text(station.label);

					// Add level indicator
					svg.append("text")
						.attr("x", node.coords[0])
						.attr("y", node.coords[1] + 25)
						.attr("text-anchor", "middle")
						.attr("font-size", "10px")
						.attr("class", "fill-muted-foreground")
						.text(`Level ${station.level}`);
				}
			});
		});

		// Highlight selected station if any
		if (selectedStation) {
			svg.selectAll(".station")
				.attr("stroke-width", function () {
					return d3.select(this).attr("data-station") === selectedStation ? 5 : 3;
				});
		}

	}, [selectedStation]);

	return (
		<div className="p-6">
			<h1 className="text-3xl font-bold mb-6 text-foreground">Career Metro Map</h1>
			<Card className="relative overflow-hidden p-0">
				<svg
					ref={svgRef}
					width="800"
					height="400"
					className="w-full h-auto bg-background"
				></svg>

				{selectedStation && (
					<div className="absolute bottom-4 right-4">
						<Card className="p-4 shadow-lg">
							<h3 className="font-bold text-foreground">{initialData.stations[selectedStation].label}</h3>
							<p className="text-sm mt-1 text-muted-foreground">Level: {initialData.stations[selectedStation].level}</p>
							<Button
								variant="ghost"
								size="sm"
								className="mt-2 h-auto p-0 text-xs text-primary hover:text-primary/90"
								onClick={() => setSelectedStation(null)}
							>
								Close
							</Button>
						</Card>
					</div>
				)}
			</Card>
		</div>
	);
}