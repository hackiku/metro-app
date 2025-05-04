// src/app/_components/metro/ui/PositionControls.tsx
import React from 'react';
import { Button } from '~/components/ui/button';
import { Target, X, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PositionControlsProps {
	positionId: string;
	onSetTarget: () => void;
	onRemoveTarget: () => void;
	onClose: () => void;
	isCurrent?: boolean;
	isTarget?: boolean;
}

export default function PositionControls({
	positionId,
	onSetTarget,
	onRemoveTarget,
	onClose,
	isCurrent = false,
	isTarget = false
}: PositionControlsProps) {
	return (
		<div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10 flex gap-3">
			{!isTarget && !isCurrent && (
				<Button
					variant="outline"
					onClick={onSetTarget}
					className="flex-1"
				>
					<Target className="h-4 w-4 mr-2" />
					Set as Target
				</Button>
			)}

			{isTarget && (
				<Button
					variant="outline"
					className="flex-1 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10"
					onClick={onRemoveTarget}
				>
					<X className="h-4 w-4 mr-2" />
					Remove Target
				</Button>
			)}

			<Button
				variant="outline"
				className="flex-1"
				asChild
			>
				<Link href={`/positions/${positionId}`}>
					<ExternalLink className="h-4 w-4 mr-2" />
					Explore
				</Link>
			</Button>

			<Button
				className="flex-1"
				asChild
			>
				<Link href={`/route?to=${positionId}`}>
					<span>Go here</span>
					<ArrowRight className="h-4 w-4 ml-2" />
				</Link>
			</Button>
		</div>
	);
}