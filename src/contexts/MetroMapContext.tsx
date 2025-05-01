// src/contexts/MetroMapContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { LayoutData, LayoutNode } from '~/types/engine';

interface MetroMapContextType {
	// View state
	viewport: {
		scale: number;
		x: number;
		y: number;
	};
	setViewport: (viewport: { scale: number; x: number; y: number }) => void;
	zoomIn: () => void;
	zoomOut: () => void;
	resetView: () => void;

	// Selection state
	selectedNodeId: string | null;
	setSelectedNodeId: (id: string | null) => void;
	currentNodeId: string | null;
	setCurrentNodeId: (id: string | null) => void;
	targetNodeId: string | null;
	setTargetNodeId: (id: string | null) => void;

	// UI state
	showGrid: boolean;
	toggleGrid: () => void;
}

const MetroMapContext = createContext<MetroMapContextType | undefined>(undefined);

interface MetroMapProviderProps {
	children: ReactNode;
	initialViewport?: { scale: number; x: number; y: number };
}

export function MetroMapProvider({
	children,
	initialViewport = { scale: 1, x: 0, y: 0 }
}: MetroMapProviderProps) {
	// View state
	const [viewport, setViewport] = useState(initialViewport);

	// Selection state
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
	const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

	// UI state
	const [showGrid, setShowGrid] = useState(process.env.NODE_ENV === 'development');

	// Zoom methods
	const zoomIn = useCallback(() => {
		setViewport(prev => ({
			...prev,
			scale: Math.min(prev.scale * 1.2, 5)
		}));
	}, []);

	const zoomOut = useCallback(() => {
		setViewport(prev => ({
			...prev,
			scale: Math.max(prev.scale / 1.2, 0.1)
		}));
	}, []);

	const resetView = useCallback(() => {
		setViewport(initialViewport);
	}, [initialViewport]);

	// UI methods
	const toggleGrid = useCallback(() => {
		setShowGrid(prev => !prev);
	}, []);

	// Create context value
	const contextValue = useMemo<MetroMapContextType>(() => ({
		viewport,
		setViewport,
		zoomIn,
		zoomOut,
		resetView,
		selectedNodeId,
		setSelectedNodeId,
		currentNodeId,
		setCurrentNodeId,
		targetNodeId,
		setTargetNodeId,
		showGrid,
		toggleGrid
	}), [
		viewport,
		zoomIn,
		zoomOut,
		resetView,
		selectedNodeId,
		currentNodeId,
		targetNodeId,
		showGrid,
		toggleGrid
	]);

	return (
		<MetroMapContext.Provider value={contextValue}>
			{children}
		</MetroMapContext.Provider>
	);
}

export function useMetroMap() {
	const context = useContext(MetroMapContext);
	if (context === undefined) {
		throw new Error('useMetroMap must be used within a MetroMapProvider');
	}
	return context;
}