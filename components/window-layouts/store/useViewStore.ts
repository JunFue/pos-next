import { create } from 'zustand';

// Extensible POS mode type — add future modes here (e.g., 'kiosk', 'drive-thru')
export type PosMode = 'desktop' | 'tablet';

const POS_MODES: PosMode[] = ['desktop', 'tablet'];

interface ViewState {
  viewState: number;
  isSplit: boolean;
  posMode: PosMode;
  isFullscreen: boolean;
  setPosMode: (mode: PosMode) => void;
  cyclePosMode: () => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  toggleFullscreen: () => void;
  setViewState: (viewState: number | ((prev: number) => number)) => void;
  setIsSplit: (isSplit: boolean | ((prev: boolean) => boolean)) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewState: 1,
  isSplit: true,
  posMode: 'desktop',
  isFullscreen: false,
  setPosMode: (mode) => set({ posMode: mode }),
  cyclePosMode: () =>
    set((state) => {
      const currentIndex = POS_MODES.indexOf(state.posMode);
      const nextIndex = (currentIndex + 1) % POS_MODES.length;
      return { posMode: POS_MODES[nextIndex] };
    }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  toggleFullscreen: () =>
    set((state) => {
      const nextState = !state.isFullscreen;
      if (typeof window !== "undefined") {
        try {
          if (nextState && !document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } else if (!nextState && document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        } catch (e) {}
      }
      return { isFullscreen: nextState };
    }),
  setViewState: (viewState) =>
    set((state) => ({
      viewState: typeof viewState === 'function' ? viewState(state.viewState) : viewState,
    })),
  setIsSplit: (isSplit) =>
    set((state) => ({
      isSplit: typeof isSplit === 'function' ? isSplit(state.isSplit) : isSplit,
    })),
}));
