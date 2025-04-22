// src/app/_components/metro/engine/dataTransformers.ts

/**
 * Transforms domain data into the format required by the visualization engine
 */
export function transformDataForVisualization(careerPaths, transitions) {
	// 1. Extract career paths
	const pathsForEngine = careerPaths.map(path => ({
		id: path.id,
		name: path.name,
		description: path.description || '',
		color: path.color
	}));

	// 2. Extract positions/roles
	let positionsForEngine = [];

	// Handle different possible data structures
	if (careerPaths[0]?.roles) {
		// The new structure with roles directly on paths
		positionsForEngine = careerPaths.flatMap(path =>
			(path.roles || []).map(role => ({
				id: role.id,
				name: role.name,
				description: role.description || '',
				level: role.level
			}))
		);
	} else if (careerPaths[0]?.positions) {
		// Alternative structure with positions property
		positionsForEngine = careerPaths.flatMap(path =>
			(path.positions || []).map(pos => ({
				id: pos.id,
				name: pos.name,
				description: pos.description || '',
				level: pos.level
			}))
		);
	}

	// 3. Create position-path mappings
	let positionPathsForEngine = [];

	if (careerPaths[0]?.roles) {
		positionPathsForEngine = careerPaths.flatMap(path =>
			(path.roles || []).map((role, index) => ({
				position_id: role.id,
				path_id: path.id,
				sequence_in_path: role.sequenceInPath || index + 1
			}))
		);
	} else if (careerPaths[0]?.positions) {
		positionPathsForEngine = careerPaths.flatMap(path =>
			(path.positions || []).map((pos, index) => ({
				position_id: pos.id,
				path_id: path.id,
				sequence_in_path: pos.sequenceInPath || index + 1
			}))
		);
	}

	// 4. Process transitions
	const transitionsForEngine = transitions.map(t => ({
		from_position_id: t.fromRoleId || t.from_position_id,
		to_position_id: t.toRoleId || t.to_position_id,
		is_recommended: t.isRecommended || t.is_recommended
	}));

	return {
		pathsForEngine,
		positionsForEngine,
		positionPathsForEngine,
		transitionsForEngine
	};
}

/**
 * Alternative transformation function for D3-oriented visualizations
 */
export function transformForD3Visualization(careerPaths, transitions) {
	// Similar to above but produces D3-specific format
	// This can be used if you need to support the old D3 hooks
	const lines = careerPaths.map(path => {
		const roles = path.roles || [];
		return {
			id: path.id,
			name: path.name,
			color: path.color,
			nodes: roles.map(role => ({
				id: role.id,
				name: role.name,
				level: role.level,
				x: 0, // Initial values, will be calculated by layout
				y: 0
			}))
		};
	});

	const connections = transitions.map(t => ({
		fromId: t.fromRoleId || t.from_position_id,
		toId: t.toRoleId || t.to_position_id,
		isRecommended: t.isRecommended || t.is_recommended
	}));

	return { lines, connections };
}