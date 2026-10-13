import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 15,
  onPageChange,
  onLimitChange,
  label = 'records'
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  // Generate visible page numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="p-3.5 sm:p-4 border-t border-brand-primaryPink/20 bg-[#FDFBFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-plum">
      {/* Result Counters & Limit Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium text-slate-600">
          {total === 0 ? (
            <span>No {label} to display</span>
          ) : (
            <span>
              Showing <span className="font-bold text-brand-dark">{from}</span>–
              <span className="font-bold text-brand-dark">{to}</span> of{' '}
              <span className="font-bold text-brand-dark">{total}</span> {label}
            </span>
          )}
        </span>

        {onLimitChange && (
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
              }}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-brand-brightPink shadow-sm cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-brand-softPink/60 text-slate-700 hover:text-brand-deepPurple font-semibold text-xs shadow-sm transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700"
          title="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-semibold select-none text-xs"
                >
                  •••
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-brand-deepPurple text-white shadow-sm ring-1 ring-brand-deepPurple'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-brand-softPink/60 hover:border-brand-primaryPink/40 shadow-sm'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-brand-softPink/60 text-slate-700 hover:text-brand-deepPurple font-semibold text-xs shadow-sm transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
