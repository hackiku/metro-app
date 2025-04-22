// src/app/_components/metro/map/MetroConnection.tsx

import React, { useMemo } from 'react';
import { useConnectionPath } from '../hooks/usePath';
import type { MetroNode, MetroConnection } from '~/types/metro';

interface MetroConnectionProps {
	connection: MetroConnection;
	nodes: MetroNode[];
	scales: {
		xScale: d3.ScaleLinear<number, number>;
		yScale: d3.ScaleLinear<number, number>;
	};
	isHighlighted?: boolean;
}

const MetroConnection: React.FC<MetroConnectionProps> = ({
	connection,
	nodes,
	scales,
	isHighlighted = false
}) => {
	// Find source and target nodes
	const sourceNode = useMemo(() =>
		nodes.find(n => n.id === connection.fromId),
		[nodes, connection.fromId]
	);

	const targetNode = useMemo(() =>
		nodes.find(n => n.id === connection.toId),
		[nodes, connection.toId]
	);

	// Generate path
	const pathData = useConnectionPath(sourceNode, targetNode, scales);

	if (!pathData) return null;

	return (
		<path
			className="connection"
			d={pathData}
			stroke={connection.isRecommended ? '#22c55e' : '#9ca3af'}
			strokeWidth={3}
			fill="none"
			strokeDasharray={connection.isRecommended ? 'none' : '5,5'}
			opacity={isHighlighted ? 1 : 0.5}
		/>
	);
};

export default React.memo(MetroConnection);