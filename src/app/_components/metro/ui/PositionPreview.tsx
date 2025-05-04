// src/app/_components/metro/ui/PositionPreview.tsx
import React from 'react';
import { X, Award, Book, Briefcase } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { Separator } from '~/components/ui/separator';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
} from "~/components/ui/drawer";
import PositionControls from './PositionControls';

interface PositionPreviewProps {
	position: any; // This should be replaced with proper type from your app
	positionDetail: any; // This should be replaced with proper type from your app
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSetTarget: (nodeId: string) => void;
	onRemoveTarget: () => void;
	onClose: () => void;
	isCurrent?: boolean;
	isTarget?: boolean;
}

export default function PositionPreview({
	position,
	positionDetail,
	isOpen,
	onOpenChange,
	onSetTarget,
	onRemoveTarget,
	onClose,
	isCurrent = false,
	isTarget = false
}: PositionPreviewProps) {
	const [showRequirements, setShowRequirements] = React.useState(true);

	if (!position || !positionDetail) {
		return null;
	}

	// Mock data - in a real app, this would come from your backend
	const requirements = [
		{ name: "Technical expertise", level: 3, current: 2 },
		{ name: "Leadership", level: 2, current: 1 },
		{ name: "Domain knowledge", level: 3, current: 3 },
		{ name: "Communication", level: 4, current: 3 },
	];

	const responsibilities = [
		"Lead small teams on technical initiatives",
		"Mentor junior team members",
		"Design and implement complex features",
		"Participate in code reviews and technical planning"
	];

	return (
		<Drawer open={isOpen} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[85%]">
				<div className="mx-auto w-full max-w-md">
					<DrawerHeader>
						<DrawerTitle className="text-xl">{position.name}</DrawerTitle>
						<DrawerDescription>
							<div className="flex items-center gap-2 mt-1">
								<Badge variant="outline" className="font-medium">
									Level {positionDetail.level}
								</Badge>
								{isCurrent && (
									<Badge variant="secondary" className="font-medium">
										Current
									</Badge>
								)}
								{isTarget && (
									<Badge className="font-medium bg-amber-500 hover:bg-amber-500/90">
										Target
									</Badge>
								)}
							</div>
						</DrawerDescription>
					</DrawerHeader>

					<div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
						{/* Position description */}
						<div className="mb-6">
							<p className="text-muted-foreground">
								{position.description || "A mid-level position focusing on technical leadership and mentoring while contributing to code and architecture."}
							</p>
						</div>

						<Separator className="my-4" />

						{/* Career path info */}
						<div className="mb-6">
							<h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
								<Briefcase className="h-4 w-4 text-primary" />
								Career Path
							</h4>
							<p className="text-sm">{positionDetail.career_path_id}</p>
							<div className="mt-2 flex items-center gap-2">
								<Progress value={75} className="h-2" />
								<span className="text-xs text-muted-foreground">Level {positionDetail.level} of 5</span>
							</div>
						</div>

						{/* Requirements section */}
						<div className="mb-6">
							<h4 className="text-sm font-medium flex items-center gap-1.5 mb-3">
								<Book className="h-4 w-4 text-primary" />
								Position Requirements
							</h4>
							<div className="space-y-3">
								{requirements.map((req, i) => (
									<div key={i} className="flex flex-col gap-1">
										<div className="flex items-center justify-between text-sm">
											<span>{req.name}</span>
											<div className="flex items-center text-xs">
												<span className={req.current >= req.level ? "text-primary" : "text-muted-foreground"}>
													{req.current}
												</span>
												<span className="mx-1 text-muted-foreground">/</span>
												<span>{req.level}</span>
											</div>
										</div>
										<div className="relative h-2 overflow-hidden rounded-full">
											<div className="absolute inset-0 bg-muted"></div>
											<div
												className="absolute inset-y-0 left-0 bg-primary"
												style={{ width: `${(req.current / req.level) * 100}%` }}
											></div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Responsibilities */}
						<div className="mb-6">
							<h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
								<Award className="h-4 w-4 text-primary" />
								Key Responsibilities
							</h4>
							<ul className="text-sm space-y-1 list-disc list-inside ml-1">
								{responsibilities.map((resp, i) => (
									<li key={i} className="text-muted-foreground">{resp}</li>
								))}
							</ul>
						</div>

						{/* Additional info could go here */}
						<div className="h-16"></div> {/* Space for floating controls */}
					</div>

					{/* Position Controls - Fixed at bottom */}
					<PositionControls
						positionId={positionDetail.id}
						onSetTarget={() => onSetTarget(positionDetail.id)}
						onRemoveTarget={onRemoveTarget}
						onClose={onClose}
						isCurrent={isCurrent}
						isTarget={isTarget}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}