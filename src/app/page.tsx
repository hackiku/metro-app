import Link from "next/link";

export default function Home() {
	return (
		<div className="flex h-screen bg-gray-900 text-white">
			{/* Sidebar */}
			<div className="w-64 bg-gray-800 p-5 shadow-lg">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-indigo-400">Learnforce</h1>
					<p className="text-sm text-gray-400">Metro Map Project</p>
				</div>

				<nav className="space-y-1">
					<Link
						href="/"
						className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
						</svg>
						<span>Dashboard</span>
					</Link>

					<Link
						href="/projects"
						className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
						</svg>
						<span>Projects</span>
					</Link>

					<Link
						href="/analytics"
						className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
						</svg>
						<span>Analytics</span>
					</Link>

					<Link
						href="/settings"
						className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
						</svg>
						<span>Settings</span>
					</Link>
				</nav>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-auto p-8">
				<header className="mb-8 border-b border-gray-700 pb-4">
					<h1 className="text-3xl font-bold text-white">Dashboard</h1>
				</header>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Dashboard card */}
					<div className="rounded-lg bg-gray-800 p-6 shadow-md">
						<h2 className="mb-4 text-xl font-semibold text-white">Project Overview</h2>
						<p className="text-gray-300">Welcome to your Metro Map project dashboard. Get started by exploring your project resources or creating new content.</p>
						<div className="mt-4">
							<button className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
								Create New
							</button>
						</div>
					</div>

					{/* Dashboard card */}
					<div className="rounded-lg bg-gray-800 p-6 shadow-md">
						<h2 className="mb-4 text-xl font-semibold text-white">Recent Activity</h2>
						<div className="space-y-3">
							<div className="flex items-center space-x-3">
								<div className="h-2 w-2 rounded-full bg-green-500"></div>
								<p className="text-gray-300">Updated project settings</p>
							</div>
							<div className="flex items-center space-x-3">
								<div className="h-2 w-2 rounded-full bg-blue-500"></div>
								<p className="text-gray-300">Added new resource</p>
							</div>
							<div className="flex items-center space-x-3">
								<div className="h-2 w-2 rounded-full bg-purple-500"></div>
								<p className="text-gray-300">Completed onboarding</p>
							</div>
						</div>
					</div>

					{/* Dashboard card */}
					<div className="rounded-lg bg-gray-800 p-6 shadow-md">
						<h2 className="mb-4 text-xl font-semibold text-white">Resources</h2>
						<ul className="space-y-2 text-gray-300">
							<li className="flex items-center space-x-2">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
								</svg>
								<span>Documentation</span>
							</li>
							<li className="flex items-center space-x-2">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
									<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
								</svg>
								<span>Project Files</span>
							</li>
							<li className="flex items-center space-x-2">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
								</svg>
								<span>Help Center</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}