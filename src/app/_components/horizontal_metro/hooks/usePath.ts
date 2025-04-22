// src/app/_components/metro/hooks/usePath.ts
import { useMemo } from 'react';
import * as d3 from 'd3';
import { generateLinePath, generateConnectionPath } from '../d3/pathGenerator';
import type { MetroNode, MetroConnection } from '~/types/metro';

interface UsePathOptions {
  rounded?: boolean;
  orthogonal?: boolean;
  cornerRadius?: number;
}

export function usePath(
  nodes: MetroNode[],
  scales: { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> },
  options: UsePathOptions = {}
) {
  const { rounded = true, orthogonal = true, cornerRadius = 10 } = options;

  return useMemo(() => {
    return generateLinePath(nodes, scales, {
      orthogonal,
      roundedCorners: rounded,
      cornerRadius
    });
  }, [nodes, scales, orthogonal, rounded, cornerRadius]);
}

export function useConnectionPath(
  sourceNode: MetroNode | undefined,
  targetNode: MetroNode | undefined,
  scales: { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> }
) {
  return useMemo(() => {
    if (!sourceNode || !targetNode) return '';
    return generateConnectionPath(sourceNode, targetNode, scales);
  }, [sourceNode, targetNode, scales]);
}