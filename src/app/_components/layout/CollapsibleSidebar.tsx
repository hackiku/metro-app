// ~/app/_components/layout/CollapsibleSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  Home,
  Layers,
  Award,
  Briefcase,
  BarChart2,
  Users,
  Settings,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
}

export function CollapsibleSidebar({ isCollapsed }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  
  return (
    <div 
      className={cn(
        "flex h-full flex-col px-2 py-4 transition-all duration-300",
        isCollapsed ? "items-center" : "px-3"
      )}
    >
      <div className={cn("mb-8", isCollapsed ? "h-6 w-6" : "px-2")}>
        {/* Logo can go here if needed */}
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="space-y-1">
          <NavItem 
            href="/skill-tree" 
            icon={<Play className="h-5 w-5" />} 
            text="Metro" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/skill-tree"}
          />
          <NavItem 
            href="/" 
            icon={<Home className="h-5 w-5" />} 
            text="Dashboard" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/"}
          />
          <NavItem 
            href="/development" 
            icon={<BarChart2 className="h-5 w-5" />} 
            text="Development" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/development"}
          />
          <NavItem 
            href="/job-family" 
            icon={<Layers className="h-5 w-5" />} 
            text="Job Families" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/job-family"}
          />
          {/* <NavItem 
            href="/career-path" 
            icon={<Award className="h-5 w-5" />} 
            text="Career Paths" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/career-path"}
          /> */}
          <NavItem 
            href="/competences" 
            icon={<Briefcase className="h-5 w-5" />} 
            text="Competences" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/competences"}
          />
          {/* <NavItem 
            href="/team" 
            icon={<Users className="h-5 w-5" />} 
            text="Team" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/team"}
          /> */}
        </nav>

        <div className="mt-auto space-y-1">
          <NavItem 
            href="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            text="Settings" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/settings"}
          />
          <NavItem 
            href="/help" 
            icon={<HelpCircle className="h-5 w-5" />} 
            text="Help & Support" 
            isCollapsed={isCollapsed}
            isActive={pathname === "/help"}
          />
        </div>
      </TooltipProvider>
    </div>
  );
}

function NavItem({ 
  href, 
  icon, 
  text, 
  isCollapsed,
  isActive
}: { 
  href: string; 
  icon: React.ReactNode; 
  text: string; 
  isCollapsed: boolean;
  isActive: boolean;
}) {
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
              isActive 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {text}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive 
          ? "bg-accent text-accent-foreground" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}