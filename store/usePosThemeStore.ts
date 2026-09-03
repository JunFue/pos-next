import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ShadowProfile = "soft" | "neon" | "retro-3d" | "glass" | "flat";
export type PosFontFamily = "lexend" | "geist-sans" | "vt323" | "geist-mono";
export type PosFontScale = "compact" | "normal" | "large";
export type PosBorderRadius = "none" | "sm" | "md" | "lg" | "full";
export type PosThemeMode = "auto" | "dark" | "light";

export interface PosThemeColors {
  background: string;
  card: string;
  muted: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  border: string;
  input: string;
  inputBorder: string;
  ring: string;
}

export interface PosThemeConfig {
  id: string;
  name: string;
  isCustom?: boolean;
  mode: PosThemeMode; // "auto" follows app light/dark mode
  colors: PosThemeColors;
  shadowProfile: ShadowProfile;
  fontFamily: PosFontFamily;
  fontScale: PosFontScale;
  borderRadius: PosBorderRadius;
  glowIntensity: "none" | "low" | "medium" | "high";
}

export const PRESET_THEMES: Record<string, PosThemeConfig> = {
  default: {
    id: "default",
    name: "Classic Slate & Blue",
    mode: "auto",
    colors: {
      background: "#0b1120",
      card: "#111827",
      muted: "#1f2937",
      foreground: "#f9fafb",
      mutedForeground: "#9ca3af",
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#f59e0b",
      border: "#374151",
      input: "#1e293b",
      inputBorder: "#4b5563",
      ring: "#3b82f6",
    },
    shadowProfile: "soft",
    fontFamily: "lexend",
    fontScale: "normal",
    borderRadius: "lg",
    glowIntensity: "medium",
  },
  sunlight: {
    id: "sunlight",
    name: "Clean Light (Sunlight)",
    mode: "light",
    colors: {
      background: "#ffffff",
      card: "#f8fafc",
      muted: "#f1f5f9",
      foreground: "#0f172a",
      mutedForeground: "#64748b",
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      secondary: "#d97706",
      border: "#e2e8f0",
      input: "#ffffff",
      inputBorder: "#cbd5e1",
      ring: "#2563eb",
    },
    shadowProfile: "soft",
    fontFamily: "lexend",
    fontScale: "normal",
    borderRadius: "lg",
    glowIntensity: "low",
  },
  "dusty-blue": {
    id: "dusty-blue",
    name: "Dusty Blue (Soothing Eyes)",
    mode: "dark",
    colors: {
      background: "#263751",
      card: "#1d2c43",
      muted: "#314463",
      foreground: "#f1f5f9",
      mutedForeground: "#94a3b8",
      primary: "#60a5fa",
      primaryForeground: "#0f172a",
      secondary: "#38bdf8",
      border: "#3d5173",
      input: "#1a273b",
      inputBorder: "#4a6288",
      ring: "#60a5fa",
    },
    shadowProfile: "soft",
    fontFamily: "lexend",
    fontScale: "normal",
    borderRadius: "lg",
    glowIntensity: "low",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Matrix",
    mode: "dark",
    colors: {
      background: "#05070d",
      card: "#0b101d",
      muted: "#131b2e",
      foreground: "#e2f8ff",
      mutedForeground: "#5c8096",
      primary: "#00f0ff",
      primaryForeground: "#000000",
      secondary: "#00ff9d",
      border: "#16304d",
      input: "#08101e",
      inputBorder: "#00f0ff88",
      ring: "#00f0ff",
    },
    shadowProfile: "neon",
    fontFamily: "geist-mono",
    fontScale: "normal",
    borderRadius: "md",
    glowIntensity: "high",
  },
  "retro-amber": {
    id: "retro-amber",
    name: "Retro CRT Amber",
    mode: "dark",
    colors: {
      background: "#120e08",
      card: "#1d170f",
      muted: "#2b2217",
      foreground: "#fbbf24",
      mutedForeground: "#b45309",
      primary: "#f59e0b",
      primaryForeground: "#120e08",
      secondary: "#d97706",
      border: "#45341c",
      input: "#19130b",
      inputBorder: "#784b12",
      ring: "#f59e0b",
    },
    shadowProfile: "retro-3d",
    fontFamily: "vt323",
    fontScale: "large",
    borderRadius: "sm",
    glowIntensity: "high",
  },
  nordic: {
    id: "nordic",
    name: "Nordic Arctic Frost",
    mode: "dark",
    colors: {
      background: "#0f172a",
      card: "#1e293b",
      muted: "#334155",
      foreground: "#f8fafc",
      mutedForeground: "#94a3b8",
      primary: "#38bdf8",
      primaryForeground: "#0f172a",
      secondary: "#67e8f9",
      border: "#334155",
      input: "#1e293b",
      inputBorder: "#475569",
      ring: "#38bdf8",
    },
    shadowProfile: "glass",
    fontFamily: "geist-sans",
    fontScale: "normal",
    borderRadius: "lg",
    glowIntensity: "medium",
  },
  "midnight-velvet": {
    id: "midnight-velvet",
    name: "Midnight Velvet",
    mode: "dark",
    colors: {
      background: "#13091f",
      card: "#1d1030",
      muted: "#2d1b47",
      foreground: "#faf5ff",
      mutedForeground: "#a885d8",
      primary: "#c084fc",
      primaryForeground: "#13091f",
      secondary: "#f472b6",
      border: "#4c2c77",
      input: "#211238",
      inputBorder: "#6b3ba8",
      ring: "#c084fc",
    },
    shadowProfile: "neon",
    fontFamily: "lexend",
    fontScale: "normal",
    borderRadius: "lg",
    glowIntensity: "high",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Cashier",
    mode: "dark",
    colors: {
      background: "#061712",
      card: "#0d261e",
      muted: "#153b30",
      foreground: "#ecfdf5",
      mutedForeground: "#6ee7b7",
      primary: "#10b981",
      primaryForeground: "#061712",
      secondary: "#34d399",
      border: "#1c5443",
      input: "#0a211a",
      inputBorder: "#287a62",
      ring: "#10b981",
    },
    shadowProfile: "soft",
    fontFamily: "lexend",
    fontScale: "normal",
    borderRadius: "md",
    glowIntensity: "medium",
  },
  espresso: {
    id: "espresso",
    name: "Espresso & Caramel",
    mode: "dark",
    colors: {
      background: "#18120e",
      card: "#241b15",
      muted: "#362920",
      foreground: "#fed7aa",
      mutedForeground: "#b48c6f",
      primary: "#ea580c",
      primaryForeground: "#ffffff",
      secondary: "#f97316",
      border: "#4d392c",
      input: "#201712",
      inputBorder: "#664d3c",
      ring: "#ea580c",
    },
    shadowProfile: "retro-3d",
    fontFamily: "lexend",
    fontScale: "normal",
    borderRadius: "sm",
    glowIntensity: "medium",
  },
};

// Helper: Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = (hex || "#000000").replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleanHex.length >= 6) {
    const num = parseInt(cleanHex.substring(0, 6), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }
  return { r: 0, g: 0, b: 0 };
}

// Helper: Calculate luminance
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper: Shift brightness of a hex color
export function adjustHexBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (num: number) => Math.min(255, Math.max(0, Math.round(num)));
  const factor = 1 + percent / 100;
  const nr = clamp(r * factor);
  const ng = clamp(g * factor);
  const nb = clamp(b * factor);
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

// Helper: Smart Auto-Harmonize
export function autoHarmonizeColors(baseBg: string, basePrimary: string): PosThemeColors {
  const bgRgb = hexToRgb(baseBg);
  const isDark = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b) < 0.35;
  const primaryRgb = hexToRgb(basePrimary);
  const primaryLum = getLuminance(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  if (isDark) {
    const card = adjustHexBrightness(baseBg, 35);
    const muted = adjustHexBrightness(baseBg, 65);
    const border = adjustHexBrightness(baseBg, 95);
    const input = adjustHexBrightness(baseBg, 20);
    const inputBorder = adjustHexBrightness(baseBg, 120);

    return {
      background: baseBg,
      card,
      muted,
      foreground: "#f8fafc",
      mutedForeground: "#94a3b8",
      primary: basePrimary,
      primaryForeground: primaryLum > 0.5 ? "#0b1120" : "#ffffff",
      secondary: adjustHexBrightness(basePrimary, -15),
      border,
      input,
      inputBorder,
      ring: basePrimary,
    };
  } else {
    const card = "#ffffff";
    const muted = adjustHexBrightness(baseBg, -5);
    const border = adjustHexBrightness(baseBg, -15);
    const input = "#ffffff";
    const inputBorder = adjustHexBrightness(baseBg, -25);

    return {
      background: baseBg,
      card,
      muted,
      foreground: "#0f172a",
      mutedForeground: "#64748b",
      primary: basePrimary,
      primaryForeground: primaryLum > 0.5 ? "#0f172a" : "#ffffff",
      secondary: adjustHexBrightness(basePrimary, 20),
      border,
      input,
      inputBorder,
      ring: basePrimary,
    };
  }
}

interface PosThemeStoreState {
  theme: PosThemeConfig;
  isCustomizing: boolean;
  setIsCustomizing: (open: boolean) => void;
  applyPreset: (presetId: string) => void;
  setMode: (mode: PosThemeMode) => void;
  setColor: (colorKey: keyof PosThemeColors, value: string) => void;
  setShadowProfile: (profile: ShadowProfile) => void;
  setFontFamily: (font: PosFontFamily) => void;
  setFontScale: (scale: PosFontScale) => void;
  setBorderRadius: (radius: PosBorderRadius) => void;
  setGlowIntensity: (intensity: "none" | "low" | "medium" | "high") => void;
  harmonize: () => void;
  resetTheme: () => void;
}

export const usePosThemeStore = create<PosThemeStoreState>()(
  persist(
    (set, get) => ({
      theme: PRESET_THEMES.default,
      isCustomizing: false,
      setIsCustomizing: (open) => set({ isCustomizing: open }),
      applyPreset: (presetId) => {
        const preset = PRESET_THEMES[presetId];
        if (preset) {
          set({
            theme: {
              ...preset,
              isCustom: false,
            },
          });
        }
      },
      setMode: (mode) => {
        const currentTheme = get().theme;
        let newColors = currentTheme.colors;
        if (mode === "light" && !currentTheme.isCustom && currentTheme.id === "default") {
          newColors = PRESET_THEMES.sunlight.colors;
        } else if (mode === "dark" && !currentTheme.isCustom && currentTheme.id === "sunlight") {
          newColors = PRESET_THEMES.default.colors;
        }
        set({
          theme: {
            ...currentTheme,
            mode,
            colors: newColors,
          },
        });
      },
      setColor: (colorKey, value) => {
        const currentTheme = get().theme;
        const newColors = { ...currentTheme.colors, [colorKey]: value };
        set({
          theme: {
            ...currentTheme,
            id: "custom",
            name: "Custom Palette",
            isCustom: true,
            colors: newColors,
          },
        });
      },
      setShadowProfile: (shadowProfile) => {
        const currentTheme = get().theme;
        set({
          theme: {
            ...currentTheme,
            shadowProfile,
          },
        });
      },
      setFontFamily: (fontFamily) => {
        const currentTheme = get().theme;
        set({
          theme: {
            ...currentTheme,
            fontFamily,
          },
        });
      },
      setFontScale: (fontScale) => {
        const currentTheme = get().theme;
        set({
          theme: {
            ...currentTheme,
            fontScale,
          },
        });
      },
      setBorderRadius: (borderRadius) => {
        const currentTheme = get().theme;
        set({
          theme: {
            ...currentTheme,
            borderRadius,
          },
        });
      },
      setGlowIntensity: (glowIntensity) => {
        const currentTheme = get().theme;
        set({
          theme: {
            ...currentTheme,
            glowIntensity,
          },
        });
      },
      harmonize: () => {
        const currentTheme = get().theme;
        const harmonizedColors = autoHarmonizeColors(
          currentTheme.colors.background,
          currentTheme.colors.primary
        );
        set({
          theme: {
            ...currentTheme,
            id: "custom",
            name: "Harmonized Custom",
            isCustom: true,
            colors: harmonizedColors,
          },
        });
      },
      resetTheme: () => {
        set({
          theme: PRESET_THEMES.default,
        });
      },
    }),
    {
      name: "pos-terminal-theme-storage",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState || version < 2 || !persistedState?.theme?.mode) {
          return {
            ...persistedState,
            theme: {
              ...PRESET_THEMES.default,
              mode: "auto",
            },
          };
        }
        return persistedState;
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);
