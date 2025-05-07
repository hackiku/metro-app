// src/components/dev/buttons/CopyJsonButton.tsx
"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface CopyJsonButtonProps {
	jsonData: any;
	tooltipText?: string;
}

export function CopyJsonButton({ jsonData, tooltipText = "Copy JSON" }: CopyJsonButtonProps) {
	const [hasCopied, setHasCopied] = useState(false);

	const handleCopy = async () => {
		if (!jsonData) return;
		try {
			const jsonString = JSON.stringify(jsonData, null, 2); // Pretty print
			await navigator.clipboard.writeText(jsonString);
			setHasCopied(true);
			setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy JSON:", err);
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleCopy}
			className="h-6 w-6 text-muted-foreground hover:text-foreground"
		>
			{hasCopied ? (
				<Check className="h-4 w-4 text-green-500" />
			) : (
				<Copy className="h-4 w-4" />
			)}
			<span className="sr-only">{hasCopied ? "Copied!" : tooltipText}</span>
		</Button>
	);
}