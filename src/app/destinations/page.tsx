// src/app/destinations/page.tsx
"use client";

import { RecommendedDestinationsPage } from "./RecommendedDestinationsPage";

// If you need specific context providers for this page:
// import { SomeContextProvider } from "~/contexts/SomeContext";

export default function DestinationsRoutePage() {
	return (
		// <SomeContextProvider>
		<div className="flex-1 p-6"> {/* Applying padding as seen in your other page.tsx files and original main tag */}
			<RecommendedDestinationsPage />
		</div>
		// </SomeContextProvider>
	);
}