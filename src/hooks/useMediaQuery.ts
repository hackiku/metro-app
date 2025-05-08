// src/hooks/useMediaQuery.ts
"use client";

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Initialize with false on the server, true value will be set after hydration
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Set up the media query
    const media = window.matchMedia(query);
    
    // Update the state with the current match
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Call once to set initial value
    updateMatches();
    
    // Set up the event listener
    media.addEventListener('change', updateMatches);
    
    // Clean up
    return () => {
      media.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}