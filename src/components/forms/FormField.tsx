// src/components/forms/FormField.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";

interface FormFieldProps {
	name: string;
	label: string;
	placeholder?: string;
	type?: "text" | "number" | "email" | "password" | "textarea" | "color";
	className?: string;
}

export function FormField({
	name,
	label,
	placeholder,
	type = "text",
	className
}: FormFieldProps) {
	const { register, formState: { errors } } = useFormContext();

	return (
		<FormItem className={className}>
			<FormLabel>{label}</FormLabel>
			<FormControl>
				{type === "textarea" ? (
					<Textarea
						{...register(name)}
						placeholder={placeholder}
						rows={3}
					/>
				) : type === "color" ? (
					<div className="flex items-center gap-3">
						<Input
							{...register(name)}
							type="color"
							className="w-16 h-8"
						/>
						<Input
							{...register(name)}
							type="text"
							placeholder="#RRGGBB"
							className="w-28"
						/>
					</div>
				) : (
					<Input
						{...register(name)}
						placeholder={placeholder}
						type={type}
					/>
				)}
			</FormControl>
			{errors[name] && <FormMessage>{errors[name]?.message as string}</FormMessage>}
		</FormItem>
	);
}