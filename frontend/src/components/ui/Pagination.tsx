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

    for (let page = windowStart; page <= windowEnd; page += 1) {
        pages.push(page);
    }

    return pages;
}

export function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
    if (lastPage <= 1) return null;

    const pages = buildPageWindow(currentPage, lastPage);

    return (
        <div className="pagination" role="navigation" aria-label="Paginacao">
            <button
                type="button"
                className="btn btn-ghost"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeftIcon />
                Anterior
            </button>

            <div className="pagination-pages">
                {pages[0] !== 1 && (
                    <>
                        <button type="button" className="pagination-number" onClick={() => onPageChange(1)}>
                            1
                        </button>
                        {pages[0] > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}

                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={`pagination-number ${page === currentPage ? "is-active" : ""}`.trim()}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                {pages.at(-1) !== lastPage && (
                    <>
                        {pages.at(-1)! < lastPage - 1 && <span className="pagination-ellipsis">...</span>}
                        <button type="button" className="pagination-number" onClick={() => onPageChange(lastPage)}>
                            {lastPage}
                        </button>
                    </>
                )}
            </div>

            <button
                type="button"
                className="btn btn-ghost"
                disabled={currentPage >= lastPage}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Proxima
                <ChevronRightIcon />
            </button>
        </div>
    );
}
