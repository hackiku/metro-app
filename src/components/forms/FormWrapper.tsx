// src/components/forms/FormWrapper.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useEffect } from "react";

interface FormWrapperProps<T extends z.ZodType> {
	schema: T;
	defaultValues?: z.infer<T>;
	onSubmit: (data: z.infer<T>) => void;
	children: React.ReactNode;
}

export function FormWrapper<T extends z.ZodType>({
	schema,
	defaultValues,
	onSubmit,
	children
}: FormWrapperProps<T>) {
	const methods = useForm({
		resolver: zodResolver(schema),
		defaultValues,
	});

	// Update form when defaultValues change (useful for edit forms)
	useEffect(() => {
		if (defaultValues) {
			methods.reset(defaultValues);
		}
	}, [defaultValues, methods]);

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
				{children}

				{/* Show form-level errors if any */}
				{methods.formState.errors.root && (
					<div className="text-destructive text-sm">
						{methods.formState.errors.root.message}
					</div>
				)}
			</form>
		</FormProvider>
	);
}