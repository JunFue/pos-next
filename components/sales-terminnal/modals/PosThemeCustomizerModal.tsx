"use client";

import React, { useState } from "react";
import {
  X,
  Palette,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Tv,
  Check,
  Zap,
  Box,
  Layers,
  Sliders,
  Type,
  Maximize2,
  ShieldAlert,
} from "lucide-react";
import {
  usePosThemeStore,
  PRESET_THEMES,
  ShadowProfile,
  PosFontFamily,
  PosFontScale,
  PosBorderRadius,
  PosThemeColors,
} from "@/store/usePosThemeStore";

interface PosThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "presets" | "colors" | "shadows" | "typography" | "radius";

export const PosThemeCustomizerModal: React.FC<PosThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    applyPreset,
    setColor,
    setShadowProfile,
    setFontFamily,
    setFontScale,
    setBorderRadius,
    setGlowIntensity,
    harmonize,
    resetTheme,
  } = usePosThemeStore();

  const [activeTab, setActiveTab] = useState<TabKey>("presets");
  const [showHarmonizedToast, setShowHarmonizedToast] = useState(false);

  if (!isOpen) return null;

  const handleHarmonize = () => {
    harmonize();
    setShowHarmonizedToast(true);
    setTimeout(() => setShowHarmonizedToast(false), 2500);
  };

  const colorFields: {
    key: keyof PosThemeColors;
    label: string;
    description: string;
  }[] = [
    {
      key: "background",
      label: "Canvas Background",
      description: "Overall terminal background",
    },
    {
      key: "card",
      label: "Card / Panel Surface",
      description: "Header, Cart, and Action panel backgrounds",
    },
    {
      key: "muted",
      label: "Muted Surfaces",
      description: "Keypads, table headers, and toolbar background",
    },
    {
      key: "foreground",
      label: "Primary Text Color",
      description: "Item names, totals, and key text",
    },
    {
      key: "mutedForeground",
      label: "Muted / Label Text",
      description: "Secondary labels and shortcuts text",
    },
    {
      key: "primary",
      label: "Primary Accent & Total Glow",
      description: "Grand Total, price highlights, and focus rings",
    },
    {
      key: "secondary",
      label: "Secondary Accent",
      description: "Badges and secondary highlights",
    },
    {
      key: "border",
      label: "Border & Divider Color",
      description: "Container outlines and table lines",
    },
  ];

  const shadowOptions: {
    id: ShadowProfile;
    label: string;
    desc: string;
    icon: any;
  }[] = [
    {
      id: "soft",
      label: "Soft Modern Elevation",
      desc: "Subtle multi-layer shadows for a clean, elegant SaaS look",
      icon: Box,
    },
    {
      id: "neon",
      label: "Cyber Neon Glow",
      desc: "Vivid ambient glow around prices, totals, and buttons",
      icon: Zap,
    },
    {
      id: "retro-3d",
      label: "Retro 3D Cash Register",
      desc: "Tactile hard offset shadows like vintage POS registers",
      icon: Tv,
    },
    {
      id: "glass",
      label: "Glassmorphism Sheen",
      desc: "Translucent backdrop blur with subtle specular highlights",
      icon: Layers,
    },
    {
      id: "flat",
      label: "Minimalist Flat",
      desc: "Zero shadow, crisp 1px hairline borders for pure speed",
      icon: Sliders,
    },
  ];

  const fontOptions: {
    id: PosFontFamily;
    label: string;
    sample: string;
    desc: string;
  }[] = [
    {
      id: "lexend",
      label: "Lexend Sans",
      sample: "₱ 1,499.00 • Fast Cashier",
      desc: "Scientifically designed to maximize reading fluency",
    },
    {
      id: "geist-sans",
      label: "Geist Sans",
      sample: "₱ 1,499.00 • Modern POS",
      desc: "Clean, geometric, precision engineered typography",
    },
    {
      id: "vt323",
      label: "VT323 Retro CRT",
      sample: "₱ 1499.00 • 80s REG 01",
      desc: "Classic dot-matrix register screen styling",
    },
    {
      id: "geist-mono",
      label: "Geist Monospace",
      sample: "₱ 1,499.00 • TECH_POS",
      desc: "Fixed-width aligned numerical display",
    },
  ];

  return (
    <div
      className="z-70 fixed inset-0 flex justify-center items-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/40 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-foreground tracking-tight">
                  POS Terminal Theme Customizer
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize colors, fonts, and synchronized shadows for your
                register screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border/50"
              title="Reset to default theme"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-border bg-muted/20 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "presets"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "colors"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Colors & Palette
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shadows")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "shadows"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Shadows & Glow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "typography"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Typography
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radius")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "radius"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Corner Radius
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-card custom-scrollbar">
          {/* 1. CURATED PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Instant POS Theme Presets
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select a hand-crafted theme optimized for various cashier
                    lighting environments.
                  </p>
                </div>
                <span className="text-xs font-medium text-primary">
                  Active: {theme.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(PRESET_THEMES).map((preset) => {
                  const isSelected =
                    !theme.isCustom && theme.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all group ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-foreground">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Swatch Previews */}
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-7 h-7 rounded-lg border shadow-sm flex items-center justify-center"
                          style={{
                            backgroundColor: preset.colors.background,
                            borderColor: preset.colors.border,
                          }}
                          title="Background"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                        </div>
                        <div
                          className="w-7 h-7 rounded-lg border shadow-sm"
                          style={{
                            backgroundColor: preset.colors.card,
                            borderColor: preset.colors.border,
                          }}
                          title="Card Surface"
                        />
                        <div
                          className="w-7 h-7 rounded-lg border shadow-sm"
                          style={{
                            backgroundColor: preset.colors.muted,
                            borderColor: preset.colors.border,
                          }}
                          title="Muted Keypad Surface"
                        />
                        <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                          <span className="capitalize">{preset.shadowProfile}</span>
                          <span>•</span>
                          <span className="capitalize">{preset.fontFamily}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. COLORS & AUTO-HARMONIZE */}
          {activeTab === "colors" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">
                      Smart Contrast Auto-Harmonizer
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pick your canvas background and primary accent, then click
                    harmonize to automatically compute optimal card depth,
                    borders, and readable text contrast.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleHarmonize}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Harmonize Theme
                </button>
              </div>

              {showHarmonizedToast && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  Theme colors successfully harmonized with synchronized
                  contrast!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {colorFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex flex-col p-3 rounded-xl border border-border/60 bg-muted/15 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-foreground block">
                          {field.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {field.description}
                        </span>
                      </div>
                      <div
                        className="w-6 h-6 rounded-md border shadow-sm shrink-0"
                        style={{
                          backgroundColor: theme.colors[field.key],
                          borderColor: theme.colors.border,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          theme.colors[field.key].startsWith("#")
                            ? theme.colors[field.key].slice(0, 7)
                            : "#3b82f6"
                        }
                        onChange={(e) => setColor(field.key, e.target.value)}
                        className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={theme.colors[field.key]}
                        onChange={(e) => setColor(field.key, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-background border border-input rounded-lg font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SHADOWS & GLOW */}
          {activeTab === "shadows" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Synchronized Shadow & Glow Style
                </h3>
                <p className="text-xs text-muted-foreground">
                  Synchronizes all card elevations, numpad button depths, focus
                  rings, and Grand Total highlights.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shadowOptions.map((opt) => {
                  const isSelected = theme.shadowProfile === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShadowProfile(opt.id)}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-md"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-bold text-sm text-foreground">
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary stroke-[3]" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/15 space-y-3">
                <span className="font-bold text-xs text-foreground block">
                  Accent Glow Intensity
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(["none", "low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setGlowIntensity(level)}
                      className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        theme.glowIntensity === level
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. TYPOGRAPHY */}
          {activeTab === "typography" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Cashier Font Typography
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select a font family tailored for high-speed scanning and visual
                  clarity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fontOptions.map((opt) => {
                  const isSelected = theme.fontFamily === opt.id;
                  const fontSampleClass =
                    opt.id === "vt323"
                      ? "font-(family-name:--font-vt323) text-lg"
                      : opt.id === "geist-mono"
                      ? "font-(family-name:--font-geist-mono)"
                      : opt.id === "geist-sans"
                      ? "font-(family-name:--font-geist-sans)"
                      : "font-(family-name:--font-lexend)";

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFontFamily(opt.id)}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-md"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-foreground">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary stroke-[3]" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {opt.desc}
                      </p>
                      <div
                        className={`p-2 rounded-lg bg-background border border-border/50 text-primary font-bold tracking-tight ${fontSampleClass}`}
                      >
                        {opt.sample}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/15 space-y-3">
                <span className="font-bold text-xs text-foreground block">
                  Font Size Scaling
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", label: "Compact (Dense)" },
                    { id: "normal", label: "Standard" },
                    { id: "large", label: "Large (High-Visibility)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFontScale(s.id as PosFontScale)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        theme.fontScale === s.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. CORNER RADIUS */}
          {activeTab === "radius" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Corner Roundness & Visual Feel
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjust the curvature of cards, inputs, buttons, and popups.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: "none", label: "Sharp", val: "0px" },
                  { id: "sm", label: "Subtle", val: "4px" },
                  { id: "md", label: "Smooth", val: "8px" },
                  { id: "lg", label: "Rounded", val: "16px" },
                  { id: "full", label: "Pill / Soft", val: "9999px" },
                ].map((r) => {
                  const isSelected = theme.borderRadius === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setBorderRadius(r.id as PosBorderRadius)}
                      className={`flex flex-col items-center justify-center p-4 border text-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-md"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                      style={{ borderRadius: r.val }}
                    >
                      <span className="font-bold text-xs text-foreground">
                        {r.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {r.val}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-t border-border shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Theme auto-saved to register memory</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
