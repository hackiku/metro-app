// ~/app/layout.tsx

import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/ui/theme-provider";
import AppLayout from "~/components/layout/AppLayout";

export const metadata: Metadata = {
	title: "Metro Map - Career Development",
	description: "Interactive tool for career development and planning",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
			<body>
				<TRPCReactProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<AppLayout>{children}</AppLayout>
					</ThemeProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}