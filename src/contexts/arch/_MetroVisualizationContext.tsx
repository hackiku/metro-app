"use client";

// src/contexts/MetroVisualizationContext.tsx
"use client";

import { createContext, useContext, useState, useRef } from "react";
import type { ReactNode } from "react";
import type { MetroViewState, MetroMapConfig, FilterOptions } from "~/types/map";
import type { CareerPath, Role } from "~/types/career";
import { useCareer } from "./CareerContext";

interface MetroVisualizationContextType {
	// View state
	viewState: MetroViewState;
	filterOptions: FilterOptions;
	mapConfig: MetroMapConfig;

	// Actions
	updateViewState: (updates: Partial<MetroViewState>) => void;
	selectRole: (roleId: string | null) => void;
	selectPath: (pathId: string | null) => void;
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
	centerOnRole: (roleId: string) => void;
	updateFilters: (updates: Partial<FilterOptions>) => void;
	updateMapConfig: (updates: Partial<MetroMapConfig>) => void;

	// Refs for external access (e.g., from components)
	mapRef: React.MutableRefObject<any>;

	// Derived data
	filteredPaths: CareerPath[];
	rolePositions: Map<string, { x: number, y: number }>;
}

// Default map configuration
const DEFAULT_MAP_CONFIG: MetroMapConfig = {
	padding: 100,
	levelSpacing: 180,
	pathSpacing: 120,
	nodeRadius: 14,
	adjustInterchanges: true,
	alignLevels: true,
	jitterAmount: 5,
	metroStylePaths: true
};

// Default view state
const DEFAULT_VIEW_STATE: MetroViewState = {
	zoom: 1,
	position: { x: 0, y: 0 },
	selectedRoleId: null,
	selectedPathId: null,
	detailsOpen: false
};

// Default filter options
const DEFAULT_FILTERS: FilterOptions = {
	skillCategory: null,
	searchQuery: "",
	levelRange: [1, 5]
};

const MetroVisualizationContext = createContext<MetroVisualizationContextType | undefined>(undefined);

export function MetroVisualizationProvider({ children }: { children: ReactNode }) {
	// Get career data from CareerContext
	const { careerPaths } = useCareer();

	// State
	const [viewState, setViewState] = useState<MetroViewState>(DEFAULT_VIEW_STATE);
	const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTERS);
	const [mapConfig, setMapConfig] = useState<MetroMapConfig>(DEFAULT_MAP_CONFIG);

	// Role positions cache (to avoid recalculating)
	const [rolePositions, setRolePositions] = useState<Map<string, { x: number, y: number }>>(new Map());

	// Refs
	const mapRef = useRef<any>(null);

	// Filter career paths based on options
	const filteredPaths = careerPaths.filter(path => {
		// If no filters are set, include all paths
		if (!filterOptions.searchQuery && !filterOptions.skillCategory &&
			filterOptions.levelRange[0] === 1 && filterOptions.levelRange[1] === 5) {
			return true;
		}

		// Check if path name or description matches search query
		const matchesSearch = !filterOptions.searchQuery ||
			path.name.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) ||
			(path.description && path.description.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()));

		if (!matchesSearch) return false;

		// Filter roles by level range and skill category
		const filteredRoles = path.roles.filter(role => {
			// Check level range
			const levelInRange = role.level >= filterOptions.levelRange[0] &&
				role.level <= filterOptions.levelRange[1];

			if (!levelInRange) return false;

			// Check skill category if specified
			if (filterOptions.skillCategory) {
				return role.requiredSkills.some(skill =>
					skill.skillName.toLowerCase().includes(filterOptions.skillCategory!.toLowerCase())
				);
			}

			return true;
		});

		// Include path if it has any matching roles after filtering
		return filteredRoles.length > 0;
	});

	// Action to update view state
	const updateViewState = (updates: Partial<MetroViewState>) => {
		setViewState(prev => ({ ...prev, ...updates }));
	};

	// Action to select a role
	const selectRole = (roleId: string | null) => {
		setViewState(prev => {
			const newState = { ...prev, selectedRoleId: roleId };

			// If selecting a role, also set its path as selected
			if (roleId) {
				const role = careerPaths.flatMap(p => p.roles).find(r => r.id === roleId);
				if (role) {
					newState.selectedPathId = role.careerPathId;
				}
			}

			return newState;
		});
	};

	// Action to select a path
	const selectPath = (pathId: string | null) => {
		setViewState(prev => {
			const newState = { ...prev, selectedPathId: pathId };

			// If the current selected role is not in this path, deselect it
			if (pathId && prev.selectedRoleId) {
				const role = careerPaths.flatMap(p => p.roles).find(r => r.id === prev.selectedRoleId);
				if (role && role.careerPathId !== pathId) {
					newState.selectedRoleId = null;
				}
			}

			return newState;
		});
	};

	// Zoom actions
	const zoomIn = () => {
		setViewState(prev => ({
			...prev,
			zoom: Math.min(prev.zoom * 1.2, 5) // Max zoom: 5x
		}));

		// If there's a mapRef implementation that handles zoom
		if (mapRef.current?.zoomIn) {
			mapRef.current.zoomIn();
		}
	};

	const zoomOut = () => {
		setViewState(prev => ({
			...prev,
			zoom: Math.max(prev.zoom / 1.2, 0.5) // Min zoom: 0.5x
		}));

		// If there's a mapRef implementation that handles zoom
		if (mapRef.current?.zoomOut) {
			mapRef.current.zoomOut();
		}
	};

	const zoomReset = () => {
		setViewState(prev => ({
			...prev,
			zoom: 1,
			position: { x: 0, y: 0 }
		}));

		// If there's a mapRef implementation that handles zoom reset
		if (mapRef.current?.zoomReset) {
			mapRef.current.zoomReset();
		}
	};

	// Center on a specific role
	const centerOnRole = (roleId: string) => {
		// Find the role position
		const position = rolePositions.get(roleId);

		if (position) {
			setViewState(prev => ({
				...prev,
				position: {
					x: -position.x + window.innerWidth / 2 / prev.zoom,
					y: -position.y + window.innerHeight / 2 / prev.zoom
				}
			}));
		}

		// If there's a mapRef implementation that handles centering
		if (mapRef.current?.centerOnRole) {
			mapRef.current.centerOnRole(roleId);
		}
	};

	// Update filters
	const updateFilters = (updates: Partial<FilterOptions>) => {
		setFilterOptions(prev => ({ ...prev, ...updates }));
	};

	// Update map configuration
	const updateMapConfig = (updates: Partial<MetroMapConfig>) => {
		setMapConfig(prev => ({ ...prev, ...updates }));
	};

	const contextValue: MetroVisualizationContextType = {
		// View state
		viewState,
		filterOptions,
		mapConfig,

		// Actions
		updateViewState,
		selectRole,
		selectPath,
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole,
		updateFilters,
		updateMapConfig,

		// Refs
		mapRef,

		// Derived data
		filteredPaths,
		rolePositions
	};

	return (
		<MetroVisualizationContext.Provider value={contextValue}>
			{children}
		</MetroVisualizationContext.Provider>
	);
}

export function useMetroVisualization() {
	const context = useContext(MetroVisualizationContext);
	if (context === undefined) {
		throw new Error('useMetroVisualization must be used within a MetroVisualizationProvider');
	}
	return context;
}