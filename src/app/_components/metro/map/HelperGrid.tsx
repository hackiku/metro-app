// src/app/_components/metro/map/HelperGrid.tsx
"use client"

interface HelperGridProps {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	gridSize?: number;
	showLabels?: boolean;
}

export function HelperGrid({
	minX,
	minY,
	maxX,
	maxY,
	gridSize = 50,
	showLabels = true
}: HelperGridProps) {
	// Calculate grid lines positions
	const xStart = Math.floor(minX / gridSize) * gridSize;
	const xEnd = Math.ceil(maxX / gridSize) * gridSize;
	const yStart = Math.floor(minY / gridSize) * gridSize;
	const yEnd = Math.ceil(maxY / gridSize) * gridSize;

	// Generate grid line positions
	const xLines = [];
	for (let x = xStart; x <= xEnd; x += gridSize) {
		xLines.push(x);
	}

	const yLines = [];
	for (let y = yStart; y <= yEnd; y += gridSize) {
		yLines.push(y);
	}

	return (
		<g className="helper-grid">
			{/* Vertical grid lines */}
			{xLines.map(x => (
				<line
					key={`x-${x}`}
					x1={x}
					y1={minY}
					x2={x}
					y2={maxY}
					stroke="var(--muted-foreground, #6b7280)"
					strokeWidth="0.5"
					strokeDasharray="4 4"
					opacity={0.3}
				/>
			))}

			{/* Horizontal grid lines */}
			{yLines.map(y => (
				<line
					key={`y-${y}`}
					x1={minX}
					y1={y}
					x2={maxX}
					y2={y}
					stroke="var(--muted-foreground, #6b7280)"
					strokeWidth="0.5"
					strokeDasharray="4 4"
					opacity={0.3}
				/>
			))}

			{/* Grid labels (optional) */}
			{showLabels && (
				<>
					{xLines.map(x => (
						<text
							key={`label-x-${x}`}
							x={x}
							y={minY + 20}
							fontSize="10"
							textAnchor="middle"
							fill="var(--muted-foreground, #6b7280)"
							opacity={0.7}
							className="select-none pointer-events-none"
						>
							{x}
						</text>
					))}

					{yLines.map(y => (
						<text
							key={`label-y-${y}`}
							x={minX - 10}
							y={y}
							fontSize="10"
							textAnchor="end"
							dominantBaseline="middle"
							fill="var(--muted-foreground, #6b7280)"
							opacity={0.7}
							className="select-none pointer-events-none"
						>
							{y}
						</text>
					))}
				</>
			)}
		</g>
	);
}

export default HelperGrid;