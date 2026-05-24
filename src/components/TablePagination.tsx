"use client";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface TablePaginationProps {
  page: number; // 1-based
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function TablePagination({
  page,
  pageSize,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalRows);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 py-2.5 border-t border-white/10 bg-white/2 text-xs">
      <div className="flex items-center gap-2 text-foreground/55">
        <span className="uppercase tracking-[0.18em]">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-foreground/85 focus:border-primary focus:outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-foreground/40">
          {startRow}-{endRow} of {totalRows}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-white/10 bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <LuChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <span className="px-2 text-foreground/55 tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-white/10 bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <LuChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
