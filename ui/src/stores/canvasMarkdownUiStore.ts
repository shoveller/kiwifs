import { create } from "zustand";
import { api } from "@kw/lib/api";
import { collectMarkdownPages } from "@kw/lib/canvasMarkdownDrag";

type MarkdownDropRecord = {
  key: string;
  at: number;
};

type CanvasMarkdownUiState = {
  addMenuOpen: boolean;
  pages: string[];
  query: string;
  loading: boolean;
  lastDrop: MarkdownDropRecord | null;
  setAddMenuOpen: (addMenuOpen: boolean) => void;
  setQuery: (query: string) => void;
  closeAddMenuAndResetQuery: () => void;
  loadPages: () => Promise<void>;
  recordDropIfFresh: (key: string, at: number) => boolean;
};

const MARKDOWN_PICKER_LIMIT = 40;
const DUPLICATE_DROP_WINDOW_MS = 250;

/**
 * Selects the Markdown pages visible in the canvas picker for the current query.
 * 현재 검색어에 맞춰 캔버스 선택기에 표시할 마크다운 페이지 목록을 고릅니다.
 *
 * @param state - Canvas Markdown UI state held in Zustand.
 * @returns At most forty page paths matching the query.
 */
export const selectFilteredMarkdownPages = (state: CanvasMarkdownUiState): string[] => {
  const query = state.query.trim().toLowerCase();
  if (!query) return state.pages.slice(0, MARKDOWN_PICKER_LIMIT);
  return state.pages
    .filter((page) => page.toLowerCase().includes(query))
    .slice(0, MARKDOWN_PICKER_LIMIT);
};

/**
 * Stores transient Markdown page insertion state for FlowCanvas.
 * FlowCanvas의 마크다운 페이지 삽입 관련 임시 상태를 저장합니다.
 *
 * The store keeps picker state, loading state, and drop de-duplication out of
 * the already-large canvas renderer while leaving React Flow nodes/edges in the
 * renderer that owns persistence and history semantics.
 */
export const useCanvasMarkdownUiStore = create<CanvasMarkdownUiState>((set, get) => ({
  addMenuOpen: false,
  pages: [],
  query: "",
  loading: false,
  lastDrop: null,
  setAddMenuOpen: (addMenuOpen) => set({ addMenuOpen }),
  setQuery: (query) => set({ query }),
  closeAddMenuAndResetQuery: () => set({ addMenuOpen: false, query: "" }),
  loadPages: async () => {
    set({ loading: true });
    try {
      const tree = await api.tree("/");
      set({ pages: collectMarkdownPages(tree), loading: false });
    } catch (error) {
      console.error("Failed to load Markdown pages for canvas picker:", error);
      set({ pages: [], loading: false });
    }
  },
  recordDropIfFresh: (key, at) => {
    const lastDrop = get().lastDrop;
    if (isDuplicateDrop(lastDrop, key, at)) return false;
    set({ lastDrop: { key, at } });
    return true;
  },
}));

/**
 * Detects duplicate browser drop deliveries for the same canvas location.
 * 같은 캔버스 위치에 대해 브라우저가 중복 전달한 drop 이벤트인지 확인합니다.
 *
 * @param lastDrop - Most recent accepted drop record.
 * @param key - Current drop identity built from path and rounded coordinates.
 * @param at - Current event timestamp in milliseconds.
 * @returns True when the drop should be ignored as a duplicate.
 */
const isDuplicateDrop = (lastDrop: MarkdownDropRecord | null, key: string, at: number): boolean => {
  if (!lastDrop) return false;
  if (lastDrop.key !== key) return false;
  return at - lastDrop.at < DUPLICATE_DROP_WINDOW_MS;
};

export type { CanvasMarkdownUiState };
