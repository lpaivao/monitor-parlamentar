import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function buildPageItems(currentPage: number, lastPage: number): PageItem[] {
  const pages = new Set<number>([1, lastPage]);

  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page > 1 && page < lastPage) pages.add(page);
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];

  for (let i = 0; i < sortedPages.length; i++) {
    const page = sortedPages[i];
    const previous = sortedPages[i - 1];

    if (previous !== undefined && page - previous > 1) {
      items.push(previous === 1 ? "ellipsis-left" : "ellipsis-right");
    }

    items.push(page);
  }

  return items;
}

function PaginationNav({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Paginacao"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 border-t border-outline-variant/70 px-4 py-4",
        className,
      )}
      {...props}
    />
  );
}

function PaginationItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}

interface PaginationLinkProps extends ComponentProps<typeof Button> {
  isActive?: boolean;
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={isActive ? "default" : "ghost"}
      aria-current={isActive ? "page" : undefined}
      className={cn("tabular-nums", className)}
      {...props}
    />
  );
}

function PaginationPrevious(props: ComponentProps<typeof Button>) {
  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5" {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span>Anterior</span>
    </Button>
  );
}

function PaginationNext(props: ComponentProps<typeof Button>) {
  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5" {...props}>
      <span>Proxima</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}

function PaginationEllipsis() {
  return (
    <span aria-hidden className="flex h-9 w-9 items-center justify-center text-outline">
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Mais paginas</span>
    </span>
  );
}

export function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const safePage = Math.min(Math.max(currentPage, 1), lastPage);
  const items = buildPageItems(safePage, lastPage);

  return (
    <PaginationNav>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          />
        </PaginationItem>

        {items.map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {typeof item === "number" ? (
              <PaginationLink
                isActive={item === safePage}
                onClick={() => onPageChange(item)}
              >
                {item}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            disabled={safePage >= lastPage}
            onClick={() => onPageChange(safePage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationNav>
  );
}
