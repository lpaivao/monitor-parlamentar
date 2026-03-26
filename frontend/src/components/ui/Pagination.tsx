import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

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

  const btnBase = "inline-flex items-center font-sans text-[13px] font-medium px-4 py-2 rounded-[var(--radius-sm)] border cursor-pointer outline-none transition-all whitespace-nowrap leading-none gap-1";
  const btnGhost = `${btnBase} text-[var(--text-muted)] bg-transparent border-[var(--border)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-raised)] hover:border-[var(--border-strong)] disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none`;
  const numBase = "font-mono text-[13px] font-medium w-[34px] h-[34px] inline-flex items-center justify-center rounded-[var(--radius-sm)] border cursor-pointer outline-none transition-all";
  const numActive = `${numBase} bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-border)] font-bold`;
  const numInactive = `${numBase} bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-raised)] hover:text-[var(--text-strong)] hover:border-[var(--border)]`;

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-4.5 border-t border-[var(--border)] flex-wrap" role="navigation" aria-label="Paginação">
      <button
        type="button"
        className={btnGhost}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeftIcon />
        Anterior
      </button>

      <div className="flex items-center gap-1">
        {pages[0] !== 1 && (
          <>
            <button type="button" className={numInactive} onClick={() => onPageChange(1)}>1</button>
            {pages[0] > 2 && <span className="text-[var(--text-dim)] text-[13px] px-1 select-none">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={p === currentPage ? numActive : numInactive}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        {pages.at(-1) !== lastPage && (
          <>
            {pages.at(-1)! < lastPage - 1 && <span className="text-[var(--text-dim)] text-[13px] px-1 select-none">…</span>}
            <button type="button" className={numInactive} onClick={() => onPageChange(lastPage)}>
              {lastPage}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        className={btnGhost}
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próxima
        <ChevronRightIcon />
      </button>
    </div>
  );
}
