// src/app/_components/metro/map/MetroLine.tsx
import React from 'react';
import { usePath } from '../hooks/usePath';
import type { MetroLine } from '~/types/metro';

interface MetroLineProps {
	line: MetroLine;
	scales: {
		xScale: d3.ScaleLinear<number, number>;
		yScale: d3.ScaleLinear<number, number>;
	};
	isSelected?: boolean;
}

const MetroLine: React.FC<MetroLineProps> = ({
	line,
	scales,
	isSelected = false
}) => {
	// Generate the path data for this line
	const pathData = usePath(line.nodes, scales, {
		rounded: true,
		orthogonal: true
	});

	return (
		<path
			className="metro-line"
			d={pathData}
			stroke={line.color}
			strokeWidth={8}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			opacity={isSelected ? 1 : 0.8}
			data-id={line.id}
		/>
	);
};

export default React.memo(MetroLine);