// src/app/_components/metro/map/components/Line.tsx
"use client"

import { memo } from "react";
import * as d3 from "d3";
import type { MetroStation } from "../../types/metro";

interface LineProps {
	stations: MetroStation[];
	color: string;
	xScale: d3.ScaleLinear<number, number>;
	yScale: d3.ScaleLinear<number, number>;
}

export const Line = memo(function Line({
	stations,
	color,
	xScale,
	yScale
}: LineProps) {
	// Don't render if there are not enough stations
	if (stations.length < 2) return null;

	// Create a line generator with a smooth curve
	const lineGenerator = d3.line<MetroStation>()
		.x(d => xScale(d.x))
		.y(d => yScale(d.y))
		.curve(d3.curveCatmullRom.alpha(0.5));

	// Generate the path data
	const pathData = lineGenerator(stations);

	return (
		<path
			d={pathData || ""}
			stroke={color}
			strokeWidth={10}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	);
});