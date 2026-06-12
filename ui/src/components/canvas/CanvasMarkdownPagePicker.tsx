import { FileText } from "lucide-react";

type Props = {
  pages: string[];
  query: string;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onReload: () => void;
  onSelectPage: (page: string) => void;
};

type PageListProps = {
  pages: string[];
  loading: boolean;
  onSelectPage: (page: string) => void;
};

/**
 * Renders the canvas toolbar control for adding existing Markdown pages.
 * 기존 마크다운 페이지를 캔버스에 추가하는 툴바 컨트롤을 렌더링합니다.
 *
 * @param props - Picker state and callbacks owned by FlowCanvas.
 * @returns A Markdown page reload/search/select section for the Add menu.
 */
export function CanvasMarkdownPagePicker({
  pages,
  query,
  loading,
  onQueryChange,
  onReload,
  onSelectPage,
}: Props) {
  return (
    <>
      <button
        className="w-full px-3 py-1.5 text-left text-sm rounded hover:bg-accent flex items-center gap-2"
        onClick={onReload}
      >
        <FileText className="h-3.5 w-3.5" /> Markdown page
      </button>
      <div className="px-2 py-1.5 border-b border-border/60">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search Markdown pages..."
          aria-label="Search Markdown pages to add to canvas"
          className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="mt-1 max-h-48 overflow-auto rounded border border-border/60 bg-background">
          <MarkdownPageList pages={pages} loading={loading} onSelectPage={onSelectPage} />
        </div>
      </div>
    </>
  );
}

/**
 * Chooses the Markdown picker list state without JSX ternaries.
 * JSX 삼항 없이 마크다운 선택기 목록 상태를 고릅니다.
 *
 * @param props - Loading flag, visible pages, and select callback.
 * @returns The loading, empty, or page-list body.
 */
function MarkdownPageList({ pages, loading, onSelectPage }: PageListProps) {
  if (loading) {
    return <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading pages...</div>;
  }
  if (pages.length === 0) {
    return <div className="px-2 py-1.5 text-xs text-muted-foreground">No Markdown pages found.</div>;
  }
  return pages.map((page) => (
    <button
      key={page}
      className="w-full px-2 py-1.5 text-left text-xs rounded hover:bg-accent flex items-center gap-2"
      title={page}
      onClick={() => onSelectPage(page)}
    >
      <FileText className="h-3 w-3 shrink-0" />
      <span className="truncate">{page}</span>
    </button>
  ));
}
