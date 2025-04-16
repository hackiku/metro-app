// src/types/map/index.ts

/**
 * Metro map visualization types
 */

export interface MetroMapConfig {
	padding: number;
	levelSpacing: number;
	pathSpacing: number;
	nodeRadius: number;
	adjustInterchanges: boolean;
	alignLevels: boolean;
	jitterAmount: number;
	metroStylePaths: boolean;
}

export interface MetroViewState {
	zoom: number;
	position: { x: number, y: number };
	selectedRoleId: string | null;
	selectedPathId: string | null;
	detailsOpen: boolean;
}

export interface MetroMapRoleNode {
	roleId: string;
	x: number;
	y: number;
	isInterchange: boolean;
}

export interface MetroConnection {
	fromRoleId: string;
	toRoleId: string;
	isRecommended: boolean;
}

export interface FilterOptions {
	skillCategory: string | null;
	searchQuery: string;
	levelRange: [number, number];
}
