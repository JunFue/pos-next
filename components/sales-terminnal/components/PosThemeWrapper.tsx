"use client";

import React, { useEffect, useMemo } from "react";
import { usePosThemeStore, hexToRgb } from "@/store/usePosThemeStore";

interface PosThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PosThemeWrapper: React.FC<PosThemeWrapperProps> = ({
  children,
  className = "",
}) => {
  const { theme } = usePosThemeStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const pRgb = hexToRgb(theme.colors.primary);
      const bRgb = hexToRgb(theme.colors.border);
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
          retroBorder: "1px solid " + theme.colors.border,
        };
      }

      if (isNeon) {
        return {
          cardShadow: `0 0 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.2), inset 0 0 15px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.05)`,
          btnShadow: `0 0 12px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`,
          primaryGlow: `0 0 18px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.6)`,
          totalGlow: `0 0 25px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.75)`,
          retroBorder: "1px solid " + theme.colors.border,
        };
      }

      if (isRetro) {
        return {
          cardShadow: `4px 4px 0px ${theme.colors.border}`,
          btnShadow: `3px 3px 0px ${theme.colors.border}`,
          primaryGlow: "none",
          totalGlow: `drop-shadow(2px 2px 0px ${theme.colors.primary}55)`,
          retroBorder: `2px solid ${theme.colors.border}`,
        };
      }

      if (isGlass) {
        return {
          cardShadow:
            "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
          btnShadow:
            "0 4px 12px 0 rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
          primaryGlow: `0 0 15px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4)`,
          totalGlow: `0 0 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.5)`,
          retroBorder: "1px solid rgba(255, 255, 255, 0.15)",
        };
      }

      // Soft Modern default
      return {
        cardShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)",
        btnShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        primaryGlow: `0 0 12px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.3)`,
        totalGlow: `0 0 16px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4)`,
        retroBorder: "1px solid " + theme.colors.border,
      };
    }, [theme]);

  // If not mounted yet (SSR hydration), render basic wrapper
  if (!mounted) {
    return <div className={`w-full h-full ${className}`}>{children}</div>;
  }

  const cssStyle = {
    // Tailwind inline variable overrides
    "--color-background": theme.colors.background,
    "--color-card": theme.colors.card,
    "--color-muted": theme.colors.muted,
    "--color-foreground": theme.colors.foreground,
    "--color-muted-foreground": theme.colors.mutedForeground,
    "--color-primary": theme.colors.primary,
    "--color-primary-foreground": theme.colors.primaryForeground,
    "--color-secondary": theme.colors.secondary,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.inputBorder,
    "--color-ring": theme.colors.ring,

    // Specific POS Design tokens
    "--pos-bg": theme.colors.background,
    "--pos-card-bg": theme.colors.card,
    "--pos-muted-bg": theme.colors.muted,
    "--pos-text": theme.colors.foreground,
    "--pos-muted-text": theme.colors.mutedForeground,
    "--pos-primary": theme.colors.primary,
    "--pos-secondary": theme.colors.secondary,
    "--pos-border": theme.colors.border,
    "--pos-shadow-card": cardShadow,
    "--pos-shadow-btn": btnShadow,
    "--pos-glow-primary": primaryGlow,
    "--pos-glow-total": totalGlow,
    "--pos-radius": radiusValue,
    "--pos-border-style": retroBorder,
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
  } as React.CSSProperties;

  return (
    <div
      style={cssStyle}
      className={`pos-themed-container w-full h-full transition-colors duration-300 ${fontClass} ${scaleClass} ${className}`}
      data-shadow-profile={theme.shadowProfile}
      data-font-family={theme.fontFamily}
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
