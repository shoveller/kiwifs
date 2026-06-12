import { beforeEach, describe, expect, it } from "vitest";
import {
  selectFilteredMarkdownPages,
  useCanvasMarkdownUiStore,
} from "./canvasMarkdownUiStore";

const resetCanvasMarkdownUiStore = () => {
  useCanvasMarkdownUiStore.setState({
    addMenuOpen: false,
    pages: [],
    query: "",
    loading: false,
    lastDrop: null,
  });
};

describe("canvasMarkdownUiStore", () => {
  beforeEach(() => {
    resetCanvasMarkdownUiStore();
  });

  it("filters Markdown pages by the current query", () => {
    const state = useCanvasMarkdownUiStore.getState();
    useCanvasMarkdownUiStore.setState({
      ...state,
      pages: ["Notes/Overview.md", "Journal/Daily.md", "Ideas/Canvas.md"],
      query: "canvas",
    });

    expect(selectFilteredMarkdownPages(useCanvasMarkdownUiStore.getState())).toEqual(["Ideas/Canvas.md"]);
  });

  it("rejects duplicate drops in the browser duplicate-delivery window", () => {
    const store = useCanvasMarkdownUiStore.getState();

    expect(store.recordDropIfFresh("Notes/Overview.md:1:2", 1_000)).toBe(true);
    expect(useCanvasMarkdownUiStore.getState().recordDropIfFresh("Notes/Overview.md:1:2", 1_100)).toBe(false);
    expect(useCanvasMarkdownUiStore.getState().recordDropIfFresh("Notes/Overview.md:1:2", 1_300)).toBe(true);
  });
});
