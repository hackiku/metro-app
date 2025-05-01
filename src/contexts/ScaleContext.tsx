// src/contexts/ScaleContext.tsx
"use client";

import React, { createContext, useContext, useState } from 'react';

interface ScaleContextType {
	scale: number;
	updateScale: (newScale: number) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

export function ScaleProvider({ children }: { children: React.ReactNode }) {
	const [scale, setScale] = useState(1);

	const updateScale = (newScale: number) => {
		setScale(newScale);
	};

	return (
		<ScaleContext.Provider value={{ scale, updateScale }}>
			{children}
		</ScaleContext.Provider>
	);
}

export function useScale() {
	const context = useContext(ScaleContext);
	if (context === undefined) {
		throw new Error('useScale must be used within a ScaleProvider');
	}
	return context;
}