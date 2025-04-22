// src/app/_components/metro/player/Player.tsx
"use client"

import { useState, useEffect } from "react"

interface PlayerProps {
  currentStationId?: string;
}

export function Player({ currentStationId }: PlayerProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Update position when station changes or coordinates are available
  useEffect(() => {
    if (!currentStationId || typeof window === 'undefined') return;
    
    // Check for station coordinates
    const updatePosition = () => {
      if (window._metroStationCoordinates && window._metroStationCoordinates[currentStationId]) {
        const coords = window._metroStationCoordinates[currentStationId];
        setPosition({ x: coords.x, y: coords.y });
      }
    };
    
    // Try immediately
    updatePosition();
    
    // Also set up an interval to check for coordinates
    // This helps when coordinates are set after the component mounts
    const intervalId = setInterval(updatePosition, 500);
    
    return () => clearInterval(intervalId);
  }, [currentStationId]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Player marker */}
        <g transform={`translate(${position.x}, ${position.y})`}>
          {/* Outer pulsing circle */}
          <circle
            className="animate-ping"
            r="4"
            fill="rgba(99, 102, 241, 0.3)"
          />

          {/* Inner solid circle */}
          <circle
            r="3"
            fill="rgb(99, 102, 241)"
            stroke="white"
            strokeWidth="1"
          />

          {/* Center dot */}
          <circle
            r="1"
            fill="white"
          />
        </g>
      </svg>
    </div>
  )
}