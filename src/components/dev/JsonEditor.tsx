// src/components/dev/JsonEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Check, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface JsonEditorProps {
	data: Record<string, any>;
	onChange: (json: Record<string, any>) => void;
}

export function JsonEditor({ data, onChange }: JsonEditorProps) {
	const [jsonText, setJsonText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isFormatted, setIsFormatted] = useState(true);

	// Format JSON with proper indentation and line breaks
	const formatJson = (json: Record<string, any>): string => {
		return JSON.stringify(json, null, 2);
	};

	// Update the editor when data changes externally
	useEffect(() => {
		try {
			const formatted = formatJson(data);
			setJsonText(formatted);
			setError(null);
			setIsFormatted(true);
		} catch (err) {
			setError("Failed to format JSON");
		}
	}, [data]);

	// Handle text changes in the editor
	const handleTextChange = (text: string) => {
		setJsonText(text);
		setIsFormatted(false);

		try {
			// Attempt to parse JSON to validate it
			const parsed = JSON.parse(text);
			setError(null);
			onChange(parsed);
		} catch (err) {
			// Only set error if there's actual content
			if (text.trim()) {
				setError("Invalid JSON");
			} else {
				setError(null);
			}
		}
	};

	// Format JSON button handler
	const handleFormat = () => {
		try {
			const parsed = JSON.parse(jsonText);
			const formatted = formatJson(parsed);
			setJsonText(formatted);
			setIsFormatted(true);
			setError(null);
		} catch (err) {
			setError("Cannot format invalid JSON");
		}
	};

	return (
		<div className="flex flex-col h-full">
			{error && (
				<Alert variant="destructive" className="mb-2">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="relative flex-1">
				<Textarea
					value={jsonText}
					onChange={(e) => handleTextChange(e.target.value)}
					className="font-mono text-sm h-full resize-none p-3"
					placeholder="Edit JSON here..."
				/>

				<div className="absolute top-2 right-2 flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleFormat}
						disabled={isFormatted}
						className="h-7 px-2 bg-background/80 backdrop-blur"
					>
						<Check className="h-3.5 w-3.5 mr-1" />
						Format
					</Button>
				</div>
			</div>

			<div className="flex justify-between text-xs text-muted-foreground mt-2">
				<span>
					{Object.keys(data).length} fields
				</span>
				{error ? (
					<span className="text-destructive">{error}</span>
				) : (
					<span>{isFormatted ? "Formatted" : "Modified"}</span>
				)}
			</div>
		</div>
	);
}