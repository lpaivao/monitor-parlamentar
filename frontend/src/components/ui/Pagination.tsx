import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

function buildPageWindow(currentPage: number, lastPage: number) {
  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(lastPage, currentPage + 2);
  const pages: number[] = [];
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
  return pages;
}

export function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = buildPageWindow(currentPage, lastPage);

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-4.5 border-t border-[var(--border)] flex-wrap" role="navigation" aria-label="Paginação">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <div className="flex items-center gap-1">
        {pages[0] !== 1 && (
          <>
            <Button type="button" variant="ghost" size="icon" className="font-mono" onClick={() => onPageChange(1)}>1</Button>
            {pages[0] > 2 && <span className="text-[var(--text-dim)] text-[13px] px-1 select-none">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Button
            key={p}
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "font-mono",
              p === currentPage && "border border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]",
            )}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        {pages.at(-1) !== lastPage && (
          <>
            {pages.at(-1)! < lastPage - 1 && <span className="text-[var(--text-dim)] text-[13px] px-1 select-none">…</span>}
            <Button type="button" variant="ghost" size="icon" className="font-mono" onClick={() => onPageChange(lastPage)}>
              {lastPage}
            </Button>
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
