"use client";
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";

// Tailwind default breakpoints
const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export const ScreenContext = createContext(null);

export function ScreenProvider({
  children,
  breakpoints = tailwindBreakpoints,
}) {
  // Detect device based on width
  const detectDeviceSync = (width, bps) => {
    const sorted = Object.entries(bps).sort((a, b) => a[1] - b[1]);

    let device = "desktop";
    for (let [key, value] of sorted) {
      if (width <= value) {
        device = key;
        break;
      }
    }
    return device;
  };

  // Initial screen (instant)
  const getInitialScreen = () => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0, device: "desktop" };
    }
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      device: detectDeviceSync(width, breakpoints),
    };
  };

  const [screen, setScreen] = useState(getInitialScreen);

  const detectDevice = useCallback(
    (width) => detectDeviceSync(width, breakpoints),
    [breakpoints]
  );

  // Sync screen detection
  useLayoutEffect(() => {
    function updateScreen() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreen({
        width,
        height,
        device: detectDevice(width),
      });
    }

    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, [detectDevice]);

  return (
    <ScreenContext.Provider value={{ screen, breakpoints }}>
      {children}
    </ScreenContext.Provider>
  );
}

// Hook: Only screen width, height, device
export function useScreen() {
  const { screen } = useContext(ScreenContext);

  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    device: screen.device,
  };
}
