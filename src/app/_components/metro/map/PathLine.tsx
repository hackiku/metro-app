"use client"

// src/app/_components/metro/map/PathLine.tsx
import { memo } from "react";
import { CareerPath } from "../types";
import { generatePathLine } from "../services/layoutService";

interface PathLineProps {
	path: CareerPath;
	isSelected?: boolean;
}

const PathLine = memo(function PathLine({
	path,
	isSelected = false
}: PathLineProps) {
	// Don't render if there are not enough roles
	if (!path.roles || path.roles.length < 2) return null;

	// Sort roles by level to ensure proper ordering
	const sortedRoles = [...path.roles].sort((a, b) => a.level - b.level);

	// Generate the path data
	const pathData = generatePathLine(sortedRoles);

	return (
		<path
			d={pathData}
			stroke={path.color}
			strokeWidth={isSelected ? 14 : 10}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			opacity={isSelected ? 1 : 0.8}
			className="transition-all duration-300"
		/>
	);
});

export default PathLine;