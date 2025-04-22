// src/app/_components/metro/hooks/useLayout.ts
import { useMemo } from 'react';
import { calculateLayout } from '../d3/layoutCalculator';
import type { MetroLine, MetroConnection, LayoutConfig } from '~/types/metro';
import type { CareerPath } from '~/types/career';

interface UseLayoutOptions {
  config?: Partial<LayoutConfig>;
}

export function useLayout(
  careerPaths: CareerPath[],
  transitions: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[],
  options: UseLayoutOptions = {}
) {
  // Transform career paths and transitions into D3-compatible format
  const d3Data = useMemo(() => {
    // This could call your transformCareerDataToD3 utility
    const lines: MetroLine[] = careerPaths.map(path => ({
      id: path.id,
      name: path.name,
      color: path.color,
      nodes: path.roles.map(role => ({
        id: role.id,
        name: role.name, // Include name to display on stations
        level: role.level,
        x: role.level * 150, // Initial x positioning based on level
        y: 0 // Initial y - will be calculated by layout
      }))
    }));

    const connections: MetroConnection[] = transitions.map(t => ({
      fromId: t.fromRoleId,
      toId: t.toRoleId,
      isRecommended: t.isRecommended
    }));

    return { lines, connections };
  }, [careerPaths, transitions]);

  // Calculate optimal layout
  const optimizedData = useMemo(() => {
    // Get the lines with optimized positions
    const optimizedLines = calculateLayout(
      d3Data.lines, 
      d3Data.connections,
      options.config
    );

    return {
      lines: optimizedLines,
      connections: d3Data.connections
    };
  }, [d3Data, options.config]);

  return optimizedData;
}