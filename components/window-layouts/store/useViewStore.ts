import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
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
        set((state) => ({
          isFullscreen: !state.isFullscreen,
        })),
      setViewState: (viewState) =>
        set((state) => ({
          viewState: typeof viewState === 'function' ? viewState(state.viewState) : viewState,
        })),
      setIsSplit: (isSplit) =>
        set((state) => ({
          isSplit: typeof isSplit === 'function' ? isSplit(state.isSplit) : isSplit,
        })),
    }),
    {
      name: 'pos-view-mode-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ posMode: state.posMode }),
    }
  )
);
