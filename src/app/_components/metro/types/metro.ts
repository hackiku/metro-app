// src/app/_components/metro/types/metro.ts

export interface MetroStation {
	id: string
	name: string
	description?: string
	level: number
	x: number
	y: number
}

export interface MetroLine {
	id: string
	name: string
	color: string
	stations: MetroStation[]
}

export interface StationSkill {
	name: string
	importance: number
}

export interface DevelopmentStep {
	name: string
	description: string
	duration: number
	type: string
}

export interface StationDetail {
	name: string
	description: string
	level: number
	skills: StationSkill[]
	developmentSteps: DevelopmentStep[]
}

// View state interface
export interface MetroViewState {
	zoom: number
	position: { x: number, y: number }
	selectedStation: MetroStation | null
	selectedLine: MetroLine | null
	detailsOpen: boolean
}

// Filter options
export interface MetroFilterOptions {
	skillCategory: string
	searchQuery: string
	levelRange: [number, number]
	schema: string
}