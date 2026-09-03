"use client";

import React, { useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  usePosThemeStore,
  PRESET_THEMES,
  hexToRgb,
  getLuminance,
} from "@/store/usePosThemeStore";

interface PosThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PosThemeWrapper: React.FC<PosThemeWrapperProps> = ({
  children,
  className = "",
}) => {
  const { theme } = usePosThemeStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine active colors based on theme.mode and resolvedTheme
  const activeColors = useMemo(() => {
    const isAutoMode = !theme.mode || theme.mode === "auto";
    const isDefaultTheme = !theme.id || theme.id === "default" || theme.id === "sunlight";

    if (!theme.isCustom && (isAutoMode || isDefaultTheme)) {
      return resolvedTheme === "light"
        ? PRESET_THEMES.sunlight.colors
        : PRESET_THEMES.default.colors;
    }

    if (theme.mode === "light") {
      return theme.isCustom ? theme.colors : PRESET_THEMES.sunlight.colors;
    }

    if (theme.mode === "dark") {
      return theme.isCustom
        ? theme.colors
        : PRESET_THEMES[theme.id]?.colors || PRESET_THEMES.default.colors;
    }

    return theme.colors;
  }, [theme, resolvedTheme]);

  const isLight = useMemo(() => {
    const bgRgb = hexToRgb(activeColors.background);
    return getLuminance(bgRgb.r, bgRgb.g, bgRgb.b) > 0.45;
  }, [activeColors.background]);

  const fontClass = useMemo(() => {
    switch (theme.fontFamily) {
      case "vt323":
        return "font-(family-name:--font-vt323) tracking-wider";
      case "geist-mono":
        return "font-(family-name:--font-geist-mono)";
      case "geist-sans":
        return "font-(family-name:--font-geist-sans)";
      case "lexend":
      default:
        return "font-(family-name:--font-lexend)";
    }
  }, [theme.fontFamily]);

  const scaleClass = useMemo(() => {
    switch (theme.fontScale) {
      case "compact":
        return "text-[13px] leading-snug";
      case "large":
        return "text-[16px] leading-relaxed";
      case "normal":
      default:
        return "text-[14px]";
    }
  }, [theme.fontScale]);

  const radiusValue = useMemo(() => {
    switch (theme.borderRadius) {
      case "none":
        return "0px";
      case "sm":
        return "4px";
      case "md":
        return "8px";
      case "lg":
        return "16px";
      case "full":
        return "9999px";
      default:
        return "12px";
    }
  }, [theme.borderRadius]);

  const { cardShadow, btnShadow, primaryGlow, totalGlow, retroBorder } =
    useMemo(() => {
      const pRgb = hexToRgb(activeColors.primary);
      const isNeon = theme.shadowProfile === "neon";
      const isRetro = theme.shadowProfile === "retro-3d";
      const isGlass = theme.shadowProfile === "glass";
      const isFlat = theme.shadowProfile === "flat";

      if (isFlat) {
        return {
          cardShadow: "none",
          btnShadow: "none",
          primaryGlow: "none",
          totalGlow: "none",
          retroBorder: "1px solid " + activeColors.border,
        };
      }

      if (isNeon) {
        return {
          cardShadow: isLight
            ? `0 4px 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15), 0 0 1px ${activeColors.border}`
            : `0 0 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.2), inset 0 0 15px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.05)`,
          btnShadow: `0 0 12px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`,
          primaryGlow: `0 0 16px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.5)`,
          totalGlow: isLight
            ? `drop-shadow(0 2px 4px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.3))`
            : `0 0 25px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.75)`,
          retroBorder: "1px solid " + activeColors.border,
        };
      }

      if (isRetro) {
        return {
          cardShadow: `4px 4px 0px ${activeColors.border}`,
          btnShadow: `3px 3px 0px ${activeColors.border}`,
          primaryGlow: "none",
          totalGlow: `drop-shadow(2px 2px 0px ${activeColors.primary}44)`,
          retroBorder: `2px solid ${activeColors.border}`,
        };
      }

      if (isGlass) {
        return {
          cardShadow: isLight
            ? "0 8px 24px -4px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)"
            : "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
          btnShadow: isLight
            ? "0 2px 8px rgba(0, 0, 0, 0.06)"
            : "0 4px 12px 0 rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
          primaryGlow: `0 0 12px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.3)`,
          totalGlow: `0 0 16px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`,
          retroBorder: isLight
            ? "1px solid rgba(0, 0, 0, 0.08)"
            : "1px solid rgba(255, 255, 255, 0.15)",
        };
      }

      // Soft Modern default
      return {
        cardShadow: isLight
          ? "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.04)"
          : "0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)",
        btnShadow: isLight
          ? "0 1px 3px rgba(0, 0, 0, 0.05)"
          : "0 2px 5px rgba(0, 0, 0, 0.2)",
        primaryGlow: `0 0 12px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
        totalGlow: isLight
          ? `drop-shadow(0 1px 2px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25))`
          : `0 0 16px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4)`,
        retroBorder: "1px solid " + activeColors.border,
      };
    }, [theme.shadowProfile, activeColors, isLight]);

  // If not mounted yet (SSR hydration), render basic wrapper
  if (!mounted) {
    return <div className={`w-full h-full ${className}`}>{children}</div>;
  }

  const cssStyle = {
    // Tailwind inline variable overrides
    "--color-background": activeColors.background,
    "--color-card": activeColors.card,
    "--color-muted": activeColors.muted,
    "--color-foreground": activeColors.foreground,
    "--color-muted-foreground": activeColors.mutedForeground,
    "--color-primary": activeColors.primary,
    "--color-primary-foreground": activeColors.primaryForeground,
    "--color-secondary": activeColors.secondary,
    "--color-border": activeColors.border,
    "--color-input": activeColors.inputBorder,
    "--color-ring": activeColors.ring,

    // Specific POS Design tokens
    "--pos-bg": activeColors.background,
    "--pos-card-bg": activeColors.card,
    "--pos-muted-bg": activeColors.muted,
    "--pos-text": activeColors.foreground,
    "--pos-muted-text": activeColors.mutedForeground,
    "--pos-primary": activeColors.primary,
    "--pos-secondary": activeColors.secondary,
    "--pos-border": activeColors.border,
    "--pos-shadow-card": cardShadow,
    "--pos-shadow-btn": btnShadow,
    "--pos-glow-primary": primaryGlow,
    "--pos-glow-total": totalGlow,
    "--pos-radius": radiusValue,
    "--pos-border-style": retroBorder,
    backgroundColor: activeColors.background,
    color: activeColors.foreground,
  } as React.CSSProperties;

  return (
    <div
      style={cssStyle}
      className={`pos-themed-container w-full h-full transition-colors duration-300 ${fontClass} ${scaleClass} ${className}`}
      data-shadow-profile={theme.shadowProfile}
      data-font-family={theme.fontFamily}
      data-pos-light={isLight ? "true" : "false"}
    >
      {children}

      {/* Scoped CSS enhancement for customized shadow/glow/retro behaviors */}
      <style jsx global>{`
        .pos-themed-container .bg-card,
        .pos-themed-container .bg-card\\/50 {
          box-shadow: var(--pos-shadow-card) !important;
          border-color: var(--pos-border) !important;
        }

        .pos-themed-container [data-shadow-profile="glass"] .bg-card,
        .pos-themed-container [data-shadow-profile="glass"] .bg-card\\/50 {
          backdrop-filter: blur(12px) !important;
        }

        .pos-themed-container [data-shadow-profile="retro-3d"] button:active {
          transform: translate(2px, 2px) !important;
        }

        .pos-themed-container .pos-total-glow {
          text-shadow: var(--pos-glow-total) !important;
        }

        .pos-themed-container .pos-primary-glow {
          box-shadow: var(--pos-glow-primary) !important;
        }

        .pos-themed-container input:focus {
          box-shadow: 0 0 0 2px var(--color-ring), var(--pos-glow-primary) !important;
        }
      `}</style>
    </div>
  );
};
