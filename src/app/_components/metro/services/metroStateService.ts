// src/app/_components/metro/services/metroStateService.ts
import { useState, useCallback } from 'react'
import { MetroFilterOptions, MetroViewState, MetroStation, MetroLine } from '../types/metro'

// Default state values
const defaultViewState: MetroViewState = {
	zoom: 1,
	position: { x: 0, y: 0 },
	selectedStation: null,
	selectedLine: null,
	detailsOpen: false,
}

const defaultFilterOptions: MetroFilterOptions = {
	skillCategory: 'all',
	searchQuery: '',
	levelRange: [1, 5],
	schema: 'gasunie',
}

// Hook for managing metro map state
export function useMetroState() {
	const [viewState, setViewState] = useState<MetroViewState>(defaultViewState)
	const [filterOptions, setFilterOptions] = useState<MetroFilterOptions>(defaultFilterOptions)

	// View state setters
	const setZoom = useCallback((zoom: number) => {
		setViewState(prev => ({ ...prev, zoom }))
	}, [])

	const setPosition = useCallback((position: { x: number, y: number }) => {
		setViewState(prev => ({ ...prev, position }))
	}, [])

	const selectStation = useCallback((station: MetroStation | null) => {
		setViewState(prev => ({
			...prev,
			selectedStation: station,
			detailsOpen: station !== null
		}))
	}, [])

	const selectLine = useCallback((line: MetroLine | null) => {
		setViewState(prev => ({ ...prev, selectedLine: line }))
	}, [])

	const toggleDetails = useCallback((open?: boolean) => {
		setViewState(prev => ({
			...prev,
			detailsOpen: open !== undefined ? open : !prev.detailsOpen
		}))
	}, [])

	// Filter setters
	const setSkillCategory = useCallback((skillCategory: string) => {
		setFilterOptions(prev => ({ ...prev, skillCategory }))
	}, [])

	const setSearchQuery = useCallback((searchQuery: string) => {
		setFilterOptions(prev => ({ ...prev, searchQuery }))
	}, [])

	const setLevelRange = useCallback((levelRange: [number, number]) => {
		setFilterOptions(prev => ({ ...prev, levelRange }))
	}, [])

	const setSchema = useCallback((schema: string) => {
		setFilterOptions(prev => ({ ...prev, schema }))
	}, [])

	// Reset functions
	const resetView = useCallback(() => {
		setViewState({
			...defaultViewState,
			selectedStation: viewState.selectedStation,
			selectedLine: viewState.selectedLine,
			detailsOpen: viewState.detailsOpen,
		})
	}, [viewState.selectedStation, viewState.selectedLine, viewState.detailsOpen])

	const resetFilters = useCallback(() => {
		setFilterOptions(defaultFilterOptions)
	}, [])

	return {
		viewState,
		filterOptions,
		setZoom,
		setPosition,
		selectStation,
		selectLine,
		toggleDetails,
		setSkillCategory,
		setSearchQuery,
		setLevelRange,
		setSchema,
		resetView,
		resetFilters,
	}
}